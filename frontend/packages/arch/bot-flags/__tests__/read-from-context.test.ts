import {
  readFgPromiseFromContext,
  readFgValuesFromContext,
} from '../src/utils/read-from-context';

describe('readFgPromiseFromContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return feature flags if set within timeout', async () => {
    const featureFlags = { feature1: true, feature2: false };
    vi.stubGlobal(
      '__fetch_fg_promise__',
      Promise.resolve({ data: featureFlags }),
    );

    const result = await readFgPromiseFromContext();
    expect(result).toEqual(featureFlags);
  });

  it('should return undefined if feature flags are not set', async () => {
    vi.stubGlobal('__fetch_fg_promise__', undefined);
    const result = await readFgPromiseFromContext();
    expect(result).toBeUndefined();
  });
});

describe('readFgValuesFromContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return feature flags if set within timeout', () => {
    const featureFlags = { feature1: true, feature2: false };
    vi.stubGlobal('__fg_values__', featureFlags);

    const result = readFgValuesFromContext();
    expect(result).toEqual(featureFlags);
  });

  it('should return undefined if feature flags are not set', async () => {
    vi.stubGlobal('__fg_values__', undefined);
    const result = await readFgValuesFromContext();
    expect(result).toBeUndefined();
  });
});
