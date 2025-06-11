import { useSyncExternalStore } from 'use-sync-external-store/shim';

import type { IExternalStore } from './external-store';

/**
 * 订阅拥有 subscribe 和 getSnapshot 方法的抽象 registry 的变化，内部使用 useSyncExternalStore 实现
 */
export const useRegistryState = <T>(registry: IExternalStore<T>) => {
  const state = useSyncExternalStore(
    registry.subscribe,
    registry.getSnapshot,
    registry.getSnapshot,
  );
  return state;
};
