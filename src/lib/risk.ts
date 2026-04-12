export type RiskStatus = 'green' | 'yellow' | 'red';

export interface MilestoneData {
  title: string;
  closed_issues: number;
  open_issues: number;
  created_at: string;
  due_on: string | null;
}

export function calculateRisk(milestone: MilestoneData): RiskStatus {
  if (!milestone.due_on) return 'green';
  
  const total = milestone.open_issues + milestone.closed_issues;
  if (total === 0) return 'green';
  
  const progress = milestone.closed_issues / total;
  const start = new Date(milestone.created_at).getTime();
  const end = new Date(milestone.due_on).getTime();
  const now = new Date().getTime();
  
  if (now > end && milestone.open_issues > 0) return 'red';
  
  const totalDuration = end - start;
  const elapsedDuration = now - start;
  const timeProgress = Math.min(1, Math.max(0, elapsedDuration / totalDuration));
  
  const healthIndex = progress - timeProgress;
  
  if (healthIndex >= 0) return 'green';
  if (healthIndex > -0.2) return 'yellow';
  return 'red';
}
