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
