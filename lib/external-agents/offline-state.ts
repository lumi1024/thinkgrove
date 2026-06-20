type AgentState = 'online' | 'offline';

export class OfflineStateStore {
  private states = new Map<string, AgentState>();

  isOffline(agentId: string): boolean {
    return this.states.get(agentId) === 'offline';
  }

  setOffline(agentId: string): void {
    this.states.set(agentId, 'offline');
  }

  setOnline(agentId: string): void {
    this.states.set(agentId, 'online');
  }

  getAllOffline(): string[] {
    return Array.from(this.states.entries())
      .filter(([, s]) => s === 'offline')
      .map(([id]) => id);
  }

  clear(): void {
    this.states.clear();
  }
}
