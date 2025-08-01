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

import React, { useEffect, useRef } from 'react';

import { useUpdateEffect } from 'ahooks';
import { IconSpin } from '@douyinfe/semi-icons';

import { useLoadMore } from '../../hooks/shortcut-bar/use-load-more';
const TIME_TO_CANCEL_MOUSE_MOVE = 50;

export interface LoadMoreListData<TData extends object> {
  list: TData[];
  hasMore: boolean;
}

export type LoadMoreListProps<TData extends object> = {
  className?: string;
  getId: (data: TData) => string;
  defaultId?: string;
  itemRender: (data: TData) => React.ReactNode;
  defaultList?: TData[];
  listTopSlot?: React.ReactNode;
  getMoreListService: (
    currentData: LoadMoreListData<TData> | undefined,
  ) => Promise<LoadMoreListData<TData>>;
  onSelect?: (data: TData) => void;
  onActiveId?: (id: string) => void;
} & Omit<React.HTMLAttributes<HTMLDivElement>, 'className' | 'onSelect'>;

export const LoadMoreList = <TData extends object>(
  props: LoadMoreListProps<TData>,
) => {
  const {
    className,
    onSelect,
    getId,
    itemRender,
    onActiveId,
    getMoreListService,
    defaultId,
    listTopSlot,
    defaultList,
    ...restProps
  } = props;
  const mouseMovingCancelIdRef = useRef<ReturnType<typeof setTimeout>>();
  const mouseMovingRef = useRef(false);
  const listRef = useRef<HTMLDivElement>(null);
  const activeItemRef = useRef<HTMLDivElement | null>(null);

  const {
    data,
    scrollIntoView,
    activeId,
    focusTo,
    goNext,
    goPrev,
    loadingMore,
    loading,
  } = useLoadMore<TData>({
    getMoreListService,
    getId: (item: TData) => getId(item),
    listRef,
    defaultList,
  });

  const list = data?.list ?? [];

  useEffect(() => {
    onActiveId?.(activeId);
  }, [activeId]);

  useUpdateEffect(() => {
    if (loading) {
      return;
    }
    const defaultItem = list.find(item => getId(item) === defaultId);
    if (defaultItem) {
      focusTo(defaultItem);
      scrollIntoView(defaultItem);
      onActiveId?.(defaultId || getId(defaultItem));
    }
  }, [loading]);

  return (
    <div
      ref={listRef}
      tabIndex={1}
      className={className}
      onMouseLeave={() => {
        focusTo(null);
      }}
      onMouseMove={() => {
        clearTimeout(mouseMovingCancelIdRef.current);
        mouseMovingRef.current = true;
        mouseMovingCancelIdRef.current = setTimeout(() => {
          mouseMovingRef.current = false;
        }, TIME_TO_CANCEL_MOUSE_MOVE);
      }}
      onKeyDown={event => {
        if (event.key === 'ArrowDown') {
          event.preventDefault();
          goNext();
          return;
        }
        if (event.key === 'ArrowUp') {
          event.preventDefault();
          goPrev();
          return;
        }
        if (event.key === 'Enter') {
          const selectItem = list.find(item => getId(item) === activeId);
          selectItem && onSelect?.(selectItem);
        }
      }}
      {...restProps}
    >
      {listTopSlot}
      {list.map(item => (
        <div
          key={getId(item)}
          data-id={getId(item)}
          ref={getId(item) === activeId ? activeItemRef : null}
          onClick={() => {
            onSelect?.(item);
          }}
          onMouseEnter={() => {
            // The mouse is in the scroll bar, which triggers the event, and the settings are only updated during mouse movement
            if (mouseMovingRef.current) {
              focusTo(item);
              listRef.current?.focus();
            }
          }}
        >
          {itemRender(item)}
        </div>
      ))}
      {loadingMore || loading ? (
        <div className="flex justify-center items-center">
          <IconSpin style={{ color: '#4D53E8' }} spin />
        </div>
      ) : null}
    </div>
  );
};
