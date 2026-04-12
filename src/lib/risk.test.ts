import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { calculateRisk, MilestoneData } from './risk';

describe('calculateRisk', () => {
  const milestone_start = '2024-01-01T00:00:00Z';
  const milestone_end = '2024-02-01T00:00:00Z';
  
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should return green if due_on is not provided', () => {
    const milestone: MilestoneData = {
      title: 'No Due Date',
      closed_issues: 0,
      open_issues: 10,
      created_at: milestone_start,
      due_on: null,
    };
    expect(calculateRisk(milestone)).toBe('green');
  });

  it('should return green if there are no issues', () => {
    const milestone: MilestoneData = {
      title: 'No Issues',
      closed_issues: 0,
      open_issues: 0,
      created_at: milestone_start,
      due_on: milestone_end,
    };
    expect(calculateRisk(milestone)).toBe('green');
  });

  it('should return red if it is overdue and has open issues', () => {
    vi.setSystemTime(new Date('2024-02-02T00:00:00Z'));
    const milestone: MilestoneData = {
      title: 'Overdue',
      closed_issues: 5,
      open_issues: 1,
      created_at: milestone_start,
      due_on: milestone_end,
    };
    expect(calculateRisk(milestone)).toBe('red');
  });

  it('should return green if progress is ahead of time', () => {
    // 50% through time
    vi.setSystemTime(new Date('2024-01-16T00:00:00Z'));
    const milestone: MilestoneData = {
      title: 'Ahead',
      closed_issues: 6, // 60% progress
      open_issues: 4,
      created_at: milestone_start,
      due_on: milestone_end,
    };
    // healthIndex = 0.6 - 0.5 = 0.1 >= 0
    expect(calculateRisk(milestone)).toBe('green');
  });

  it('should return yellow if progress is slightly behind time', () => {
    // 50% through time
    vi.setSystemTime(new Date('2024-01-16T00:00:00Z'));
    const milestone: MilestoneData = {
      title: 'Slightly Behind',
      closed_issues: 4, // 40% progress
      open_issues: 6,
      created_at: milestone_start,
      due_on: milestone_end,
    };
    // healthIndex = 0.4 - 0.5 = -0.1 > -0.2
    expect(calculateRisk(milestone)).toBe('yellow');
  });

  it('should return red if progress is significantly behind time', () => {
    // 50% through time
    vi.setSystemTime(new Date('2024-01-16T00:00:00Z'));
    const milestone: MilestoneData = {
      title: 'Significantly Behind',
      closed_issues: 2, // 20% progress
      open_issues: 8,
      created_at: milestone_start,
      due_on: milestone_end,
    };
    // healthIndex = 0.2 - 0.5 = -0.3 <= -0.2
    expect(calculateRisk(milestone)).toBe('red');
  });
});
