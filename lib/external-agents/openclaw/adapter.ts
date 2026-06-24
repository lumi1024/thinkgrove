import type { ExternalAgentAdapter, ExternalAgentRequest, ExternalAgentResponse } from '../types';

export interface OpenClawAdapterConfig {
  endpoint: string;
  deviceToken: string;
  deviceId: string;
  publicKey: string;
}

type WSMessage = {
  type: 'req' | 'res' | 'event';
  id?: string;
  method?: string;
  event?: string;
  params?: Record<string, unknown>;
  payload?: unknown;
  ok?: boolean;
  error?: { code: string; message: string };
};

export class OpenClawAdapter implements ExternalAgentAdapter {
  readonly framework = 'openclaw' as const;
  private endpoint: string;
  private deviceToken: string;
  private deviceId: string;
  private publicKey: string;
  private ws: WebSocket | null = null;
  private connected = false;
  private pending = new Map<string, { resolve: (v: unknown) => void; reject: (e: Error) => void }>();
  private eventHandlers: ((msg: WSMessage) => void)[] = [];

  constructor(config: OpenClawAdapterConfig) {
    this.endpoint = config.endpoint.replace(/^ws?:/, 'ws:');
    this.deviceToken = config.deviceToken;
    this.deviceId = config.deviceId;
    this.publicKey = config.publicKey;
    try {
      this.connect().catch(() => {});
    } catch {
      // Connection failure is non-fatal at construction time
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      await this.ensureConnected();
      return this.connected;
    } catch {
      return false;
    }
  }

  async invoke(req: ExternalAgentRequest): Promise<ExternalAgentResponse> {
    const ok = await this.healthCheck();
    if (!ok) {
      throw new Error('OpenClaw adapter not connected');
    }

    return new Promise<ExternalAgentResponse>((resolve, reject) => {
      const id = crypto.randomUUID();
      const timeout = setTimeout(() => {
        this.pending.delete(id);
        reject(new Error('OpenClaw invoke timeout (10s)'));
      }, 10_000);

      this.pending.set(id, {
        resolve: (data) => {
          clearTimeout(timeout);
          const payload = data as any;
          const text = payload?.text || payload?.content || '';
          const model = payload?.model || 'openclaw';
          resolve({ text, model });
        },
        reject: (e) => {
          clearTimeout(timeout);
          reject(e as Error);
        },
      });

      this.send({
        type: 'req',
        id,
        method: 'chat.send',
        params: {
          message: this.buildMessage(req),
          agentId: req.agentId,
        },
      });
    });
  }

  dispose(): void {
    if (this.ws) {
      this.ws.close(1000, 'dispose');
      this.ws = null;
    }
    this.connected = false;
    this.pending.clear();
    this.eventHandlers = [];
  }

  private async ensureConnected(): Promise<void> {
    if (this.connected && this.ws?.readyState === WebSocket.OPEN) return;
    await this.connect();
  }

  private connect(): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.endpoint);
      } catch (e) {
        reject(e as Error);
        return;
      }

      const challengeTimeout = setTimeout(() => {
        reject(new Error('OpenClaw connect.challenge timeout (15s)'));
      }, 15_000);

      const onMessage = (evt: MessageEvent) => {
        let msg: WSMessage;
        try {
          msg = JSON.parse(evt.data as unknown as string) as WSMessage;
        } catch {
          return;
        }

        if (msg.type === 'event' && msg.event === 'connect.challenge') {
          clearTimeout(challengeTimeout);
          this.ws!.removeEventListener('message', onMessage);
          const payload = msg.payload as { nonce: string; ts: number };
          this.sendConnectRequest(payload.nonce, payload.ts);
          return;
        }

        if (msg.type === 'res' && msg.id) {
          const pending = this.pending.get(msg.id);
          if (pending) {
            this.pending.delete(msg.id);
            if (msg.ok) {
              pending.resolve(msg.payload);
            } else {
              pending.reject(new Error(msg.error?.message || 'OpenClaw RPC error'));
            }
            return;
          }
        }

        if (msg.type === 'event') {
          const payload = msg.payload as any;
          if (payload?.type === 'hello-ok') {
            clearTimeout(challengeTimeout);
            this.connected = true;
            this.ws!.removeEventListener('message', onMessage);
            this.setupEventHandlers();
            resolve();
            return;
          }
          for (const h of this.eventHandlers) h(msg);
        }
      };

      this.ws.addEventListener('message', onMessage);
      this.ws.addEventListener('close', () => {
        this.connected = false;
      });
      this.ws.addEventListener('error', () => {
        reject(new Error('OpenClaw WebSocket connection error'));
      });
    });
  }

  private sendConnectRequest(nonce: string, ts: number): void {
    this.send({
      type: 'req',
      id: crypto.randomUUID(),
      method: 'connect',
      params: {
        minProtocol: 4,
        maxProtocol: 4,
        client: { id: 'thinkgrove', version: '1.0.0', platform: 'macos' },
        role: 'operator',
        scopes: ['operator.read', 'operator.write'],
        auth: { token: this.deviceToken },
        device: {
          id: this.deviceId,
          publicKey: this.publicKey,
          signature: this.signNonce(nonce),
          signedAt: ts,
          nonce,
        },
      },
    });
  }

  private signNonce(nonce: string): string {
    return `sig_${nonce.slice(0, 8)}`;
  }

  private send(msg: WSMessage): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error('WebSocket not open');
    }
    this.ws.send(JSON.stringify(msg));
  }

  private setupEventHandlers(): void {
    if (!this.ws) return;
    this.ws.addEventListener('message', (evt: MessageEvent) => {
      let msg: WSMessage;
      try { msg = JSON.parse(evt.data as unknown as string) as WSMessage; } catch { return; }
      for (const h of this.eventHandlers) h(msg);
    });
  }

  private buildMessage(req: ExternalAgentRequest): string {
    if (req.action === 'awaken') {
      return `${req.context.domain} 域已经 24 小时没有新枝桠。请提出一个具体、开放、可能引发讨论的问题，30-80 字，不要寒暄。`;
    }
    return `请围绕「${req.context.topic}」给出一段 80-160 字的回答。领域：${req.context.domain}。不要寒暄。`;
  }
}
