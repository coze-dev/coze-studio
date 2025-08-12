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

import { useSpaceList } from '../hooks';

vi.mock('@coze-foundation/space-store-adapter', () => ({
  useSpaceStore: vi.fn(),
}));

vi.mock('@coze-foundation/enterprise-store-adapter', () => ({
  useCurrentEnterpriseInfo: () => null,
}));

describe('useRefreshSpaces', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  it('should return correct state from useSpaceList & useRefreshSpaces', async () => {
    const mockSpaceList = [
      {
        id: '1',
        name: 'Space 1',
      },
    ];
    useSpaceStore.getState = vi.fn();
    const mockFetchSpaces = vi.fn().mockResolvedValue([]);
    (useSpaceStore.getState as Mock).mockReturnValue({
      inited: true,
      fetchSpaces: mockFetchSpaces,
    });
    vi.mocked(useSpaceStore).mockReturnValue([]);
    const { result, waitForNextUpdate } = renderHook(() => useSpaceList(true));
    expect(result.current.spaces).toEqual([]);
    expect(result.current.loading).toEqual(true);
    vi.mocked(useSpaceStore).mockReturnValue(mockSpaceList);
    await waitForNextUpdate();
    expect(result.current.spaces).toEqual(mockSpaceList);
    expect(result.current.loading).toBe(false);
  });
});
