import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ExternalAgentQuota } from '@/lib/external-agents/quota';
import { getAgentState, bumpAgentAction, setAgentRest, resetAgentDailyIfStale } from '@/lib/db/repos';

vi.mock('@/lib/db/repos');

describe('ExternalAgentQuota', () => {
  let quota: ExternalAgentQuota;

  beforeEach(() => {
    quota = new ExternalAgentQuota();
    vi.clearAllMocks();
  });

  it('allows action when agent is not resting and under quota', async () => {
    vi.mocked(getAgentState).mockReturnValue(null);
    vi.mocked(resetAgentDailyIfStale).mockReturnValue(undefined);

    const result = await quota.canAct('ext_openclaw', 'openclaw');
    expect(result.allowed).toBe(true);
  });

  it('blocks action when agent is resting', async () => {
    const restUntil = new Date(Date.now() + 3600_000).toISOString().replace('T', ' ');
    vi.mocked(getAgentState).mockReturnValue({ rest_until: restUntil, actions_today: 0 });

    const result = await quota.canAct('ext_openclaw', 'openclaw');
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain('休息');
  });

  it('blocks action when daily quota exceeded', async () => {
    vi.mocked(getAgentState).mockReturnValue({ rest_until: null, actions_today: 5 });

    const result = await quota.canAct('ext_hermes', 'hermes');
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain('配额');
  });

  it('records action and triggers rest at threshold', async () => {
    vi.mocked(getAgentState).mockReturnValue({ rest_until: null, actions_today: 9 });
    vi.mocked(bumpAgentAction).mockReturnValue({ actionsToday: 10 });

    await quota.recordAction('ext_openclaw', 'openclaw');
    expect(setAgentRest).toHaveBeenCalled();
  });
});
