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

import { renderHook, act } from '@testing-library/react-hooks';
import { type ShortCutCommand } from '@coze-agent-ide/tool-config';

import {
  useLoadMore,
  getNextActiveItem,
  getPreviousItem,
} from '../../../src/hooks/shortcut-bar/use-load-more';

describe('useLoadMore', () => {
  it('should initialize with default values', async () => {
    const { result } = renderHook(() =>
      useLoadMore<ShortCutCommand>({
        getId: item => item.command_id,
        listRef: { current: null },
        getMoreListService: async () =>
          Promise.resolve({ list: [], hasMore: false }),
      }),
    );

    expect(result.current.activeId).toBe('');
    expect(result.current.loadingMore).toBe(false);
    expect(result.current.data).toEqual({ list: [], hasMore: false });
    expect(result.current.loading).toBe(true);

    await act(() => {});
    expect(result.current.loading).toBe(false);
  });

  it('should load more when reaching limit', async () => {
    const getMoreListService = vi
      .fn()
      .mockResolvedValue({ list: [{ id: '2' }], hasMore: false });
    const { result, waitForNextUpdate } = renderHook(() =>
      useLoadMore({
        getId: item => item.id,
        listRef: { current: null },
        getMoreListService,
        defaultList: [{ id: '1' }],
      }),
    );

    act(() => {
      result.current.goNext();
    });

    await waitForNextUpdate();

    expect(getMoreListService).toHaveBeenCalled();
    expect(result.current.data.list).toEqual([{ id: '1' }, { id: '2' }]);
  });
});

describe('getNextActiveItem', () => {
  it('should return next item and reach limit flag', () => {
    const result = getNextActiveItem({
      curItem: { id: '1' },
      list: [{ id: '1' }, { id: '2' }, { id: '3' }],
      getId: item => item.id,
    });

    expect(result).toEqual({ reachLimit: true, item: { id: '2' } });
  });
});

describe('getPreviousItem', () => {
  it('should return previous item and reach limit flag', () => {
    const result = getPreviousItem({
      curItem: { id: '2' },
      list: [{ id: '1' }, { id: '2' }, { id: '3' }],
      getId: item => item.id,
    });

    expect(result).toEqual({ reachLimit: false, item: { id: '1' } });
  });
});
