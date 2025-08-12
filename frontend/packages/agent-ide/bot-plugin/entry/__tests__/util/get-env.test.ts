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

// Introducing our test method

import { describe, expect, it, vi } from 'vitest';

import { getEnv } from '@/util/get-env';

describe('getEnv function', () => {
  it('should return "cn-boe" when not in production', () => {
    vi.stubGlobal('IS_PROD', undefined);
    // Do not set IS_PROD, default to non-production environment
    const env = getEnv();
    expect(env).toBe('cn-boe');
  });

  it('should return "cn-release" when in production, not overseas, and is release version', () => {
    vi.stubGlobal('IS_PROD', true); // Set to production environment
    vi.stubGlobal('IS_OVERSEA', false); // Not overseas.
    vi.stubGlobal('IS_RELEASE_VERSION', true); // Is the release version
    const env = getEnv();
    expect(env).toBe('cn-release');
  });

  it('should return "cn-inhouse" when in production, not overseas, and is not release version', () => {
    vi.stubGlobal('IS_PROD', true); // Set to production environment
    vi.stubGlobal('IS_OVERSEA', false); // Not overseas.
    vi.stubGlobal('IS_RELEASE_VERSION', false); // Not the release version
    const env = getEnv();
    expect(env).toBe('cn-inhouse');
  });

  it('should return "oversea-release" when in production, overseas, and is release version', () => {
    vi.stubGlobal('IS_PROD', true); // Set to production environment
    vi.stubGlobal('IS_OVERSEA', true); // Is overseas
    vi.stubGlobal('IS_RELEASE_VERSION', true); // Is the release version
    const env = getEnv();
    expect(env).toBe('oversea-release');
  });

  it('should return "oversea-inhouse" when in production, overseas, and is not release version', () => {
    vi.stubGlobal('IS_PROD', true); // Set to production environment
    vi.stubGlobal('IS_OVERSEA', true); // Is overseas
    vi.stubGlobal('IS_RELEASE_VERSION', false); // Not the release version
    const env = getEnv();
    expect(env).toBe('oversea-inhouse');
  });
});
