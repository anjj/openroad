'use server';
import { getOctokit } from './octokit';
import { calculateRisk, RiskStatus, MilestoneData } from './risk';

export interface MilestoneResult {
  id: number;
  number: number;
  title: string;
  description: string | null;
  state: string;
  open_issues: number;
  closed_issues: number;
  due_on: string | null;
  health: RiskStatus;
  progress: number;
  repoName: string;
}

export interface IssueResult {
  id: string | number;
  number: number;
  title: string;
  state: string;
  status: string | null;
}

export interface OrgResult {
  login: string;
  id: number;
}

export async function getOrganizations(): Promise<OrgResult[]> {
  const octokit = await getOctokit();
  const { data } = await octokit.rest.orgs.listForAuthenticatedUser();
  return data.map(org => ({
    login: org.login,
    id: org.id,
  }));
}

export async function getOrgMilestones(org: string): Promise<MilestoneResult[]> {
  const octokit = await getOctokit();
  const { data: repos } = await octokit.rest.repos.listForOrg({
    org,
    type: 'all',
    sort: 'updated',
    per_page: 50,
  });

  const milestonePromises = repos.map(async (repo) => {
    try {
      const { data: ms } = await octokit.rest.issues.listMilestones({
        owner: org,
        repo: repo.name,
        state: 'all',
        sort: 'due_on',
        direction: 'asc',
      });

      return ms.map(m => {
        const milestoneData: MilestoneData = {
          title: m.title,
          closed_issues: m.closed_issues,
          open_issues: m.open_issues,
          created_at: m.created_at,
          due_on: m.due_on,
          state: m.state,
        };
        const total = m.open_issues + m.closed_issues;
        return {
          id: m.id,
          number: m.number,
          title: m.title,
          description: m.description,
          state: m.state,
          open_issues: m.open_issues,
          closed_issues: m.closed_issues,
          due_on: m.due_on,
          health: 'gray' as RiskStatus,
          progress: total > 0 ? (m.closed_issues / total) * 100 : 0,
          repoName: repo.name,
          milestoneData, 
        };
      });
    } catch (e) {
      return [];
    }
  });

  const allMilestonesRaw = await Promise.all(milestonePromises);
  const allMilestones = allMilestonesRaw.flat().sort((a, b) => {
    if (!a.due_on) return 1;
    if (!b.due_on) return -1;
    return new Date(a.due_on).getTime() - new Date(b.due_on).getTime();
  });

  const now = new Date().getTime();
  let foundCurrent = false;

  return allMilestones.map(m => {
    let isCurrent = false;
    if (m.state === 'open' && m.due_on && !foundCurrent) {
      if (new Date(m.due_on).getTime() >= now) {
        isCurrent = true;
        foundCurrent = true;
      }
    }
    return {
      id: m.id,
      number: m.number,
      title: m.title,
      description: m.description,
      state: m.state,
      open_issues: m.open_issues,
      closed_issues: m.closed_issues,
      due_on: m.due_on,
      health: calculateRisk(m.milestoneData, isCurrent),
      progress: m.progress,
      repoName: m.repoName,
    };
  });
}

export async function getMilestoneIssues(owner: string, repo: string, milestoneNumber: number): Promise<IssueResult[]> {
  const octokit = await getOctokit();
  
  const query = `
    query($owner: String!, $repo: String!, $number: Int!) {
      repository(owner: $owner, name: $repo) {
        milestone(number: $number) {
          issues(first: 100) {
            nodes {
              id
              number
              title
              state
              projectItems(first: 3) {
                nodes {
                  fieldValueByName(name: "status") {
                    ... on ProjectV2ItemFieldSingleSelectValue {
                      name
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  `;

  try {
    const response: any = await octokit.graphql(query, { owner, repo, number: milestoneNumber });
    const issues = response?.repository?.milestone?.issues?.nodes;

    if (issues && issues.length > 0) {
      return issues.map((issue: any) => ({
        id: issue.id,
        number: issue.number,
        title: issue.title,
        state: issue.state.toLowerCase(),
        status: issue.projectItems.nodes[0]?.fieldValueByName?.name || null,
      }));
    }
  } catch (e) {
    console.error("GraphQL Fallback Triggered:", e);
  }

  const { data: restIssues } = await octokit.rest.issues.listForRepo({
    owner,
    repo,
    milestone: milestoneNumber.toString(),
    state: 'all',
    per_page: 100,
  });

  return restIssues.map(issue => ({
    id: issue.id,
    number: issue.number,
    title: issue.title,
    state: issue.state,
    status: null,
  }));
}

export interface RepoResult {
  id: number;
  full_name: string;
  name: string;
}

export async function getRepositories(): Promise<RepoResult[]> {
  const octokit = await getOctokit();
  const { data } = await octokit.rest.repos.listForAuthenticatedUser({
    sort: 'updated',
    per_page: 100,
  });

  return data.map(r => ({
    id: r.id,
    full_name: r.full_name,
    name: r.name,
  }));
}

export async function getMilestones(owner: string, repo: string): Promise<MilestoneResult[]> {
  const octokit = await getOctokit();
  const { data } = await octokit.rest.issues.listMilestones({
    owner,
    repo,
    state: 'all',
    sort: 'due_on',
    direction: 'asc',
  });

  const now = new Date().getTime();
  let foundCurrent = false;

  return data.map(m => {
    const milestoneData: MilestoneData = {
      title: m.title,
      closed_issues: m.closed_issues,
      open_issues: m.open_issues,
      created_at: m.created_at,
      due_on: m.due_on,
      state: m.state,
    };
    
    let isCurrent = false;
    if (m.state === 'open' && m.due_on && !foundCurrent) {
      if (new Date(m.due_on).getTime() >= now) {
        isCurrent = true;
        foundCurrent = true;
      }
    }

    const total = m.open_issues + m.closed_issues;
    return {
      id: m.id,
      number: m.number,
      title: m.title,
      description: m.description,
      state: m.state,
      open_issues: m.open_issues,
      closed_issues: m.closed_issues,
      due_on: m.due_on,
      health: calculateRisk(milestoneData, isCurrent),
      progress: total > 0 ? (m.closed_issues / total) * 100 : 0,
      repoName: repo,
    };
  });
}
