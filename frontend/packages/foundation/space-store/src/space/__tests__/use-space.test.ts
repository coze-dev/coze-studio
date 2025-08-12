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

import { renderHook } from '@testing-library/react-hooks';
import { useSpaceStore } from '@coze-foundation/space-store-adapter';

import { useSpace } from '../hooks';

vi.mock('@coze-foundation/space-store-adapter', () => ({
  useSpaceStore: vi.fn(),
}));

vi.mock('@coze-foundation/enterprise-store-adapter', () => ({
  useCurrentEnterpriseInfo: () => null,
}));

describe('useRefreshSpaces', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useSpaceStore.getState = vi.fn().mockReturnValue({
      fetchSpaces: vi.fn(),
      inited: true,
    });
  });
  it('should return current space when id matches', () => {
    const mockSpaceList = [
      {
        id: '1',
        name: 'Space 1',
      },
      {
        id: '2',
        name: 'Space 2',
      },
    ];
    vi.mocked(useSpaceStore).mockImplementation(callback =>
      callback({
        spaceList: mockSpaceList,
      }),
    );

    const { result } = renderHook(() => useSpace('1'));
    expect(result.current.space).toEqual(mockSpaceList[0]);
  });
});
