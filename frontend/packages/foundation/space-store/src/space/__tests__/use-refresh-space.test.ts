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

import { type Mock } from 'vitest';
import { renderHook } from '@testing-library/react-hooks';
import { useSpaceStore } from '@coze-foundation/space-store-adapter';

import { useRefreshSpaces } from '../hooks';

vi.mock('@coze-foundation/space-store-adapter', () => ({
  useSpaceStore: {
    getState: vi.fn(),
  },
}));

vi.mock('@coze-foundation/enterprise-store-adapter', () => ({
  useCurrentEnterpriseInfo: () => null,
}));

describe('useRefreshSpaces', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should set loading to true and fetch spaces when refresh is true', async () => {
    const mockFetchSpaces = vi.fn().mockResolvedValue([]);
    (useSpaceStore.getState as Mock).mockReturnValue({
      inited: true,
      fetchSpaces: mockFetchSpaces,
    });
    const { result, waitForNextUpdate } = renderHook(() =>
      useRefreshSpaces(true),
    );
    expect(result.current).toBe(true);
    expect(mockFetchSpaces).toHaveBeenCalledTimes(1);

    await waitForNextUpdate();

    expect(result.current).toBe(false);
  });

  it('should set loading to false when refresh is false and spaces are already initialized', () => {
    (useSpaceStore.getState as Mock).mockReturnValue({
      inited: true,
      fetchSpaces: vi.fn(),
    });

    const { result } = renderHook(() => useRefreshSpaces(false));

    expect(result.current).toBe(false);
  });

  it('should set loading to false when refresh is undefined and spaces are already initialized', () => {
    (useSpaceStore.getState as Mock).mockReturnValue({
      inited: true,
      fetchSpaces: vi.fn(),
    });

    const { result } = renderHook(() => useRefreshSpaces());

    expect(result.current).toBe(false);
  });
});
