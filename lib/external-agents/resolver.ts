import type { ExternalAgentAdapter } from './types';
import { HermesAdapter } from './hermes/adapter';
import { OpenClawAdapter } from './openclaw/adapter';

export interface AgentConfigForResolver {
  id: string;
  framework?: string;
  endpoint: string;
  authToken?: string;
  deviceId?: string;
  publicKey?: string;
}

export class ExternalAgentResolver {
  private cache = new Map<string, ExternalAgentAdapter>();

  resolve(config: AgentConfigForResolver): ExternalAgentAdapter | null {
    if (!config.framework || !config.endpoint) return null;

    const resolvedToken = this.resolveAuthToken(config.authToken);
    if (!resolvedToken) return null;

    const cacheKey = `${config.framework}:${config.id}`;
    const cached = this.cache.get(cacheKey);
    if (cached) return cached;

    let adapter: ExternalAgentAdapter | null = null;

    switch (config.framework) {
      case 'hermes':
        adapter = new HermesAdapter({
          endpoint: config.endpoint,
          authToken: resolvedToken,
        });
        break;
      case 'openclaw': {
        if (!config.deviceId || !config.publicKey) {
          console.warn(`[external-agents] OpenClaw agent ${config.id} missing deviceId or publicKey`);
          return null;
        }
        adapter = new OpenClawAdapter({
          endpoint: config.endpoint,
          deviceToken: resolvedToken,
          deviceId: config.deviceId,
          publicKey: config.publicKey,
        });
        break;
      }
      default:
        console.warn(`[external-agents] unknown framework "${config.framework}" for agent ${config.id}`);
        return null;
    }

    this.cache.set(cacheKey, adapter);
    return adapter;
  }

  resolveAuthToken(raw?: string): string | null {
    if (!raw) return null;
    const m = raw.match(/^\$\{(\w+)\}$/);
    if (m) {
      const val = process.env[m[1]];
      if (!val) {
        console.warn(`[external-agents] env var ${m[1]} not found for authToken`);
        return null;
      }
      return val;
    }
    return raw;
  }

  disposeAll(): void {
    for (const adapter of this.cache.values()) {
      adapter.dispose();
    }
    this.cache.clear();
  }
}
