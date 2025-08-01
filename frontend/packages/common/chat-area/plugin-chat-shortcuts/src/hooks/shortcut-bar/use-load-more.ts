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

import { type RefObject, useMemo, useState } from 'react';

import { useInfiniteScroll } from 'ahooks';

import { useImperativeLayoutEffect } from '../use-imperative-layout-effect';
import { type LoadMoreListData } from '../../components/load-more-list';

export interface LoadMoreHookProps<TData extends object> {
  getId: (item: TData) => string;
  listRef: RefObject<HTMLDivElement>;
  defaultList?: TData[];
  getMoreListService: (
    currentData: LoadMoreListData<TData> | undefined,
  ) => Promise<LoadMoreListData<TData>>;
}
export const useLoadMore = <TData extends object>(
  props: LoadMoreHookProps<TData>,
) => {
  const { getId, listRef, getMoreListService, defaultList } = props;
  const [activeId, setActiveId] = useState('');

  const { data, loadingMore, loading, loadMore } = useInfiniteScroll<
    LoadMoreListData<TData>
  >(currentData => getMoreListService(currentData), {
    target: listRef,
    isNoMore: d => !d?.hasMore,
  });

  const resultData = useMemo(() => {
    if (defaultList) {
      return {
        list: defaultList.concat(data?.list ?? []),
        hasMore: !!data?.hasMore,
      };
    }
    return {
      list: data?.list ?? [],
      hasMore: !!data?.hasMore,
    };
  }, [data]);

  const { list } = resultData;

  const focusTo = (toItem: TData | null) => {
    if (!toItem) {
      setActiveId('');
      return;
    }
    if (!listRef.current) {
      return;
    }
    const findItem = list.find(item => getId(toItem) === getId(item));
    if (!findItem) {
      return;
    }
    const itemId = getId(findItem);
    setActiveId(itemId);
  };

  const focusFirst = () => {
    const firstItem = list[0];
    firstItem && focusTo(firstItem);
  };

  const scrollToFirst = () => {
    if (!listRef.current) {
      return;
    }
    listRef.current.scrollTop = 0;
  };

  const scrollIntoView = useImperativeLayoutEffect((toItem: TData) => {
    const itemId = getId(toItem);
    const itemRef = listRef.current?.querySelector(`[data-id="${itemId}"]`);
    if (!itemRef) {
      return;
    }
    itemRef.scrollIntoView({
      behavior: 'instant' as ScrollBehavior,
      block: 'nearest',
    });
  });

  const goNext = () => {
    const curItem = list.find(item => getId(item) === activeId);
    if (!curItem) {
      return;
    }
    const { item: nextItem, reachLimit } = getNextActiveItem<TData>({
      getId,
      list,
      curItem,
    });
    if (reachLimit) {
      loadMore();
    }
    if (!loadingMore) {
      focusTo(nextItem);
      scrollIntoView(nextItem);
    }
  };

  const goPrev = () => {
    const curItem = list.find(item => getId(item) === activeId);
    if (!curItem) {
      return;
    }
    const { item: prevItem, reachLimit } = getPreviousItem<TData>({
      getId,
      list,
      curItem,
    });
    if (reachLimit) {
      loadMore();
    }
    focusTo(prevItem);
    scrollIntoView(prevItem);
  };

  return {
    activeId,
    focusFirst,
    focusTo,
    scrollToFirst,
    scrollIntoView,
    goNext,
    goPrev,
    loadingMore,
    data: resultData,
    loading,
  };
};
const getTargetItemAndIndex = <TData extends object>({
  getId,
  list,
  target,
}: {
  getId: (item: TData) => string;
  list: TData[];
  target: TData;
}) => {
  let targetIndex = -1;
  const targetItem = list.find((item, index) => {
    if (getId(item) === getId(target)) {
      targetIndex = index;
      return true;
    }
    return false;
  });
  return {
    targetItem,
    targetIndex,
  };
};

export const getNextActiveItem = <TData extends object>({
  curItem,
  list,
  getId,
}: {
  curItem: TData;
  list: TData[];
  getId: (item: TData) => string;
}): {
  reachLimit: boolean;
  item: TData;
} => {
  const { targetIndex } = getTargetItemAndIndex({
    getId,
    list,
    target: curItem,
  });
  if (targetIndex < 0) {
    return {
      reachLimit: false,
      item: curItem,
    };
  }
  // eslint-disable-next-line @typescript-eslint/no-magic-numbers
  const reachLimit = targetIndex >= list.length - 3;
  const nextIndex = (targetIndex + 1) % list.length;
  const item = list.at(nextIndex) || curItem;
  return {
    reachLimit,
    item,
  };
};

export const getPreviousItem = <TData extends object>({
  curItem,
  list,
  getId,
}: {
  curItem: TData;
  list: TData[];
  getId: (item: TData) => string;
}): {
  reachLimit: boolean;
  item: TData;
} => {
  const { targetIndex } = getTargetItemAndIndex({
    getId,
    list,
    target: curItem,
  });
  if (targetIndex < 0) {
    return {
      reachLimit: false,
      item: curItem,
    };
  }
  const reachLimit = targetIndex === 0;
  const nextIdx = (targetIndex - 1) % list.length;
  const item = list.at(nextIdx) || curItem;
  return {
    reachLimit,
    item,
  };
};
