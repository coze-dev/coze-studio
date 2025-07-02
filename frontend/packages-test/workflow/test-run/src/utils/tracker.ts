import { nanoid } from 'nanoid';

export type ExtraType = Record<string, any>;

/**
 * cache 类型
 */
export interface CacheMapType {
  start: number;
  disabled: boolean;
  extra?: ExtraType;
}

export class Tracker {
  cache = new Map<string, CacheMapType>();

  start(extra?: ExtraType) {
    const key = nanoid();
    const start = performance.now();
    const prev = this.cache.get(key);
    const value = {
      start,
      extra,
      // 如果已经存在，则永久禁用该事件上报
      disabled: !!prev,
    };
    this.cache.set(key, value);
    return key;
  }
  end(key: string): null | (CacheMapType & { duration: number }) {
    const prev = this.cache.get(key);
    if (!prev || prev.disabled) {
      return null;
    }
    const duration = performance.now() - prev.start;
    // 成功上报重置状态，等待下一次上报
    this.cache.delete(key);
    return { ...prev, duration };
  }
}
