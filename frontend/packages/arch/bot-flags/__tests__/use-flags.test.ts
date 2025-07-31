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

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react-hooks';

import { featureFlagStorage } from '../src/utils/storage';
import { useFlags } from '../src/use-flags'; // Adjust the import path
import { getFlags } from '../src/get-flags';

vi.mock('../src/utils/storage', () => ({
  featureFlagStorage: {
    on: vi.fn(),
    off: vi.fn(),
  },
}));

vi.mock('../src/get-flags', () => ({
  getFlags: vi.fn(),
}));

describe('useFlags', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should return initial flags', () => {
    const initialFlags = { feature1: true, feature2: false };
    getFlags.mockImplementation(() => initialFlags);

    const { result } = renderHook(() => useFlags());

    expect(result.current[0]).toEqual(initialFlags);
  });

  it('should update flags on storage change', () => {
    const initialFlags = { feature1: true, feature2: false };
    const updatedFlags = { feature1: false, feature2: true };
    getFlags.mockImplementation(() => initialFlags);

    const { result } = renderHook(() => useFlags());

    act(() => {
      getFlags.mockImplementation(() => updatedFlags);
      featureFlagStorage.on.mock.calls[0][1](); // Simulate 'change' event
    });

    expect(result.current[0]).toEqual(updatedFlags);
  });

  it('should remove event listener on unmount', () => {
    const { unmount } = renderHook(() => useFlags());

    unmount();

    expect(featureFlagStorage.off).toHaveBeenCalled();
  });
});
