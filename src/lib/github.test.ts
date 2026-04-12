import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getMilestones } from './github';
import { getOctokit } from './octokit';

vi.mock('./octokit', () => ({
  getOctokit: vi.fn(),
}));

describe('getMilestones', () => {
  it('fetches and calculates risk for milestones', async () => {
    const mockOctokit = {
      rest: {
        issues: {
          listMilestones: vi.fn().mockResolvedValue({
            data: [
              {
                id: 1,
                title: 'v1.0',
                description: 'First release',
                state: 'open',
                open_issues: 2,
                closed_issues: 8,
                created_at: '2024-01-01T00:00:00Z',
                due_on: '2024-12-31T00:00:00Z',
              },
            ],
          }),
        },
      },
    };

    (getOctokit as any).mockResolvedValue(mockOctokit);

    const milestones = await getMilestones('owner', 'repo');

    expect(milestones).toHaveLength(1);
    expect(milestones[0].title).toBe('v1.0');
    expect(milestones[0].progress).toBe(80);
    expect(milestones[0].health).toBeDefined();
  });
});
