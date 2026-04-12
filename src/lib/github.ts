'use server';
import { getOctokit } from './octokit';
import { calculateRisk, RiskStatus } from './risk';

export interface MilestoneResult {
  id: number;
  title: string;
  description: string | null;
  state: string;
  open_issues: number;
  closed_issues: number;
  due_on: string | null;
  health: RiskStatus;
  progress: number;
}

export async function getMilestones(owner: string, repo: string): Promise<MilestoneResult[]> {
  const octokit = await getOctokit();
  const { data } = await octokit.rest.issues.listMilestones({
    owner,
    repo,
    state: 'open',
    sort: 'due_on',
    direction: 'asc',
  });

  return data.map(m => {
    const milestoneData = {
      title: m.title,
      closed_issues: m.closed_issues,
      open_issues: m.open_issues,
      created_at: m.created_at,
      due_on: m.due_on,
    };
    const total = m.open_issues + m.closed_issues;
    return {
      id: m.id,
      title: m.title,
      description: m.description,
      state: m.state,
      open_issues: m.open_issues,
      closed_issues: m.closed_issues,
      due_on: m.due_on,
      health: calculateRisk(milestoneData),
      progress: total > 0 ? (m.closed_issues / total) * 100 : 0,
    };
  });
}
