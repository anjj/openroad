export type RiskStatus = 'green' | 'yellow' | 'red' | 'blue' | 'gray';

export interface MilestoneData {
  title: string;
  closed_issues: number;
  open_issues: number;
  created_at: string;
  due_on: string | null;
  state: string;
}

/**
 * Simplified Risk Logic:
 * - CLOSED: Blue
 * - OPEN + Overdue: Red
 * - OPEN + Current (closest future): Green (calculated outside)
 * - OPEN + Future: Gray (calculated outside)
 */
export function calculateRisk(milestone: MilestoneData, isCurrent: boolean = false): RiskStatus {
  if (milestone.state === 'closed') return 'blue';
  
  if (!milestone.due_on) return 'gray';
  
  const end = new Date(milestone.due_on).getTime();
  const now = new Date().getTime();
  
  // Overdue
  if (now > end) return 'red';
  
  // Current vs Future
  return isCurrent ? 'green' : 'gray';
}
