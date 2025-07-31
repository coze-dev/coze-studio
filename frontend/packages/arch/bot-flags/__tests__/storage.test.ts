/*
 * Copyright 2025 coze-dev Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

describe('FeatureFlagStorage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it('should initialize correctly', async () => {
    const { featureFlagStorage } = await import('../src/utils/storage');
    expect(featureFlagStorage.inited).toBe(false);
  });

  it('should return inited status correctly', async () => {
    const { featureFlagStorage } = await import('../src/utils/storage');
    expect(featureFlagStorage.inited).toBe(false);
    featureFlagStorage.setFlags({ feature1: true });
    expect(featureFlagStorage.inited).toBe(true);
  });

  it('should set and get feature flags correctly', async () => {
    const { featureFlagStorage } = await import('../src/utils/storage');
    const flags = { feature1: true, feature2: false };
    featureFlagStorage.setFlags(flags);
    const fgValues = featureFlagStorage.getFlags();

    expect(fgValues.feature1).toEqual(true);
    expect(fgValues.feature2).toEqual(false);
    // fallback to false if key not exits
    expect(fgValues.feature3).toEqual(false);
  });

  it('should emit change event on setting new flags', async () => {
    const { featureFlagStorage } = await import('../src/utils/storage');
    const flags = { feature1: true, feature2: false };
    const listener = vi.fn();
    featureFlagStorage.on('change', listener);

    featureFlagStorage.setFlags(flags);
    expect(listener).toHaveBeenCalledWith(flags);
  });

  it('should not emit change event when setting same flags', async () => {
    const { featureFlagStorage } = await import('../src/utils/storage');
    const flags = { feature1: true, feature2: false };
    featureFlagStorage.setFlags(flags);

    const listener = vi.fn();
    featureFlagStorage.on('change', listener);

    featureFlagStorage.setFlags(flags);
    expect(listener).not.toHaveBeenCalled();
  });

  it('should throw error when getting flags before initialization', async () => {
    vi.stubEnv('NODE_ENV', 'development');
    const { featureFlagStorage } = await import('../src/utils/storage');
    expect(() => featureFlagStorage.getFlags()).toThrow(
      'Trying access feature flag values before the storage been init.',
    );
  });

  it('should clear flags correctly', async () => {
    vi.stubEnv('NODE_ENV', 'development');
    const { featureFlagStorage } = await import('../src/utils/storage');
    featureFlagStorage.setFlags({ feature1: true });
    featureFlagStorage.clear();
    expect(() => featureFlagStorage.getFlags()).toThrow();
  });

  it('should return all keys', async () => {
    const { featureFlagStorage } = await import('../src/utils/storage');
    featureFlagStorage.setFlags({ feature1: true, feature2: false });
    const flags = featureFlagStorage.getFlags();
    expect(flags.keys).toEqual(['feature1', 'feature2']);
  });

  it('should return none keys', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    const { featureFlagStorage } = await import('../src/utils/storage');
    const flags = featureFlagStorage.getFlags();
    expect(flags.keys).toEqual([]);
  });

  it('should return isInited', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    const { featureFlagStorage } = await import('../src/utils/storage');
    const flags = featureFlagStorage.getFlags();
    expect(flags.isInited).toEqual(false);
    featureFlagStorage.setFlags({ feature1: true, feature2: false });
    expect(flags.isInited).toEqual(true);
  });

  it('should unshift the function into interceptors by calling `use`', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    const { featureFlagStorage } = await import('../src/utils/storage');
    const fnGetter = vi.fn();
    featureFlagStorage.use(fnGetter);
    const flags = featureFlagStorage.getFlags();
    const testKey = 'bot.arch.bot.fg.test.1';
    // trigger get of the proxy
    flags[testKey];
    expect(fnGetter).toHaveBeenCalledWith(testKey);

    // trigger set of the proxy
    const fnSetter = vi.fn(() => {
      flags['bot.arch.bot.fg.test.1'] = true;
    });
    expect(fnSetter).toThrowError();
  });
});
