import { getAgentState, bumpAgentAction, setAgentRest, resetAgentDailyIfStale } from '@/lib/db/repos';

export interface QuotaConfig {
  dailyAwaken: number;
  actionsBeforeRest: number;
  restHours: number;
}

const FRAMEWORK_QUOTAS: Record<string, QuotaConfig> = {
  openclaw: { dailyAwaken: 5, actionsBeforeRest: 10, restHours: 4 },
  hermes: { dailyAwaken: 3, actionsBeforeRest: 7, restHours: 6 },
};

export interface CanActResult {
  allowed: boolean;
  reason?: string;
}

export class ExternalAgentQuota {
  async canAct(agentId: string, framework: string): Promise<CanActResult> {
    const config = FRAMEWORK_QUOTAS[framework];
    if (!config) return { allowed: true };

    const today = new Date().toISOString().split('T')[0];
    resetAgentDailyIfStale(agentId, today);

    const state = getAgentState(agentId);
    if (!state) return { allowed: true };

    if (state.rest_until) {
      const restEnd = new Date(state.rest_until.replace(' ', 'T'));
      if (restEnd > new Date()) {
        return {
          allowed: false,
          reason: `${agentId} 正在休息 (${state.rest_until} 前不可唤醒)`,
        };
      }
    }

    if ((state.actions_today ?? 0) >= config.dailyAwaken) {
      return {
        allowed: false,
        reason: `${agentId} 今日配额已用完 (${config.dailyAwaken} 次/天)`,
      };
    }

    return { allowed: true };
  }

  async recordAction(agentId: string, framework: string): Promise<void> {
    const config = FRAMEWORK_QUOTAS[framework];
    if (!config) return;

    const bumped = bumpAgentAction(agentId);
    if (bumped.actionsToday > 0 && bumped.actionsToday % config.actionsBeforeRest === 0) {
      const restUntil = new Date(Date.now() + config.restHours * 3600 * 1000);
      setAgentRest(agentId, restUntil);
    }
  }
}
