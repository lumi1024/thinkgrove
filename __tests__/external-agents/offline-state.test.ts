import { describe, it, expect } from 'vitest';
import { OfflineStateStore } from '@/lib/external-agents/offline-state';

describe('OfflineStateStore', () => {
  it('starts all agents as online', () => {
    const store = new OfflineStateStore();
    expect(store.isOffline('ext_a')).toBe(false);
  });

  it('can mark agent offline', () => {
    const store = new OfflineStateStore();
    store.setOffline('ext_a');
    expect(store.isOffline('ext_a')).toBe(true);
  });

  it('can restore agent online', () => {
    const store = new OfflineStateStore();
    store.setOffline('ext_a');
    store.setOnline('ext_a');
    expect(store.isOffline('ext_a')).toBe(false);
  });

  it('getAllOffline returns only offline agents', () => {
    const store = new OfflineStateStore();
    store.setOffline('ext_a');
    store.setOffline('ext_b');
    expect(store.getAllOffline()).toEqual(['ext_a', 'ext_b']);
  });

  it('independent state per agentId', () => {
    const store = new OfflineStateStore();
    store.setOffline('ext_a');
    expect(store.isOffline('ext_b')).toBe(false);
  });
});
