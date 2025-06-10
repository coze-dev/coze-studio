// 引入我们的被测方法

import { describe, expect, it, vi } from 'vitest';

import { getEnv } from '@/util/get-env';

describe('getEnv function', () => {
  it('should return "cn-boe" when not in production', () => {
    vi.stubGlobal('IS_PROD', undefined);
    // 不设置IS_PROD，默认为非生产环境
    const env = getEnv();
    expect(env).toBe('cn-boe');
  });

  it('should return "cn-release" when in production, not overseas, and is release version', () => {
    vi.stubGlobal('IS_PROD', true); // 设置为生产环境
    vi.stubGlobal('IS_OVERSEA', false); // 不是海外
    vi.stubGlobal('IS_RELEASE_VERSION', true); // 是发布版本
    const env = getEnv();
    expect(env).toBe('cn-release');
  });

  it('should return "cn-inhouse" when in production, not overseas, and is not release version', () => {
    vi.stubGlobal('IS_PROD', true); // 设置为生产环境
    vi.stubGlobal('IS_OVERSEA', false); // 不是海外
    vi.stubGlobal('IS_RELEASE_VERSION', false); // 不是发布版本
    const env = getEnv();
    expect(env).toBe('cn-inhouse');
  });

  it('should return "oversea-release" when in production, overseas, and is release version', () => {
    vi.stubGlobal('IS_PROD', true); // 设置为生产环境
    vi.stubGlobal('IS_OVERSEA', true); // 是海外
    vi.stubGlobal('IS_RELEASE_VERSION', true); // 是发布版本
    const env = getEnv();
    expect(env).toBe('oversea-release');
  });

  it('should return "oversea-inhouse" when in production, overseas, and is not release version', () => {
    vi.stubGlobal('IS_PROD', true); // 设置为生产环境
    vi.stubGlobal('IS_OVERSEA', true); // 是海外
    vi.stubGlobal('IS_RELEASE_VERSION', false); // 不是发布版本
    const env = getEnv();
    expect(env).toBe('oversea-inhouse');
  });
});
