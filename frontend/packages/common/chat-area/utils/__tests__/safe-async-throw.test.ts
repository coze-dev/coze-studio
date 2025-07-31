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

import { expect, it, vi } from 'vitest';

import { safeAsyncThrow } from '../src/safe-async-throw';

it('throw in IS_DEV_MODE', () => {
  vi.stubGlobal('IS_PROD', true);
  vi.stubGlobal('IS_DEV_MODE', true);
  expect(() => safeAsyncThrow('1')).toThrow();
});

it('do not throw in BUILD env', () => {
  vi.stubGlobal('IS_DEV_MODE', false);
  vi.stubGlobal('IS_BOE', false);
  vi.stubGlobal('IS_PROD', true);
  vi.stubGlobal('window', {
    gfdatav1: {
      canary: 0,
    },
  });
  vi.useFakeTimers();
  safeAsyncThrow('1');
  try {
    vi.runAllTimers();
  } catch (e) {
    expect((e as Error).message).toBe('[chat-area] 1');
  }
  vi.useRealTimers();
});
