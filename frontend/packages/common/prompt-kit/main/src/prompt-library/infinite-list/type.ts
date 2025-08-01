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

import { type ReactElement, type RefObject } from 'react';

import {
  type ListProps,
  type EmptyStateProps,
  type ButtonProps,
} from '@coze-arch/coze-design';

export interface EmptyProps {
  className?: string;
  isError?: boolean;
  isLoading?: boolean;
  loadRetry?: () => void; //retry loading
  size?: EmptyStateProps['size'];
  text?: {
    emptyTitle?: string;
    emptyDesc?: string;
    searchEmptyTitle?: string;
  };
  btn?: {
    emptyClick?: () => void; //
    emptyText?: string;
    emptyButtonProps?: ButtonProps;
  };
  icon?: ReactElement;

  renderEmpty?: (
    emptyProps: Omit<EmptyProps, 'renderEmpty'>,
  ) => React.ReactNode | null;
}
export interface FooterProps {
  isError?: boolean; // Whether loading error
  isLoading?: boolean; // Is it loading?
  noMore?: boolean; //No more data.
  isNeedBtnLoadMore?: boolean;
  dataNum?: number;
  loadRetry?: () => void; //retry loading
  renderFooter?: (
    footerProps: Omit<FooterProps, 'renderFooter'>,
  ) => React.ReactNode | null;
}

export interface InfiniteListDataProps<T> {
  list: T[];
  hasMore?: boolean;
  // nextPage: number;
  cursor: string;
  [key: string]: unknown;
}

export interface ScrollProps<T> {
  threshold?: number; //How far is it from below to start loading data?
  targetRef?: RefObject<HTMLDivElement>; // Listening for scrolling Dom references
  loadData: (
    current: InfiniteListDataProps<T>,
  ) => Promise<InfiniteListDataProps<T>>; // Load more data
  reloadDeps?: unknown[]; // Reloading data dependencies
  isNeedBtnLoadMore?: boolean;
  isLoading?: boolean; // Is it loading?
  resetDataIfReload?: boolean; // When reloading, whether to reset the existing data in the list first, the default is true
}

export interface InfiniteListProps<T>
  extends Partial<
    Pick<ListProps<T>, 'className' | 'emptyContent' | 'grid' | 'renderItem'>
  > {
  containerClassName?: string;
  canShowData?: boolean; //Can the data be displayed?
  isSearching?: boolean; // Whether it is in the search, it is mainly used for error display, select Copy to use
  itemClassName?: string | ((item: T) => string);
  isNeedBtnLoadMore?: boolean;
  isResponsive?: boolean;
  emptyConf?: {
    className?: string;
    renderEmpty?: EmptyProps['renderEmpty'];
    text?: EmptyProps['text'];
    btn?: EmptyProps['btn'];
    icon?: EmptyProps['icon'];
    size?: EmptyProps['size'];
  };
  renderFooter?: FooterProps['renderFooter'];
  scrollConf: ScrollProps<T>;
  rowKey?: string;
  retryFunc?: () => void;
  onChangeState?: (loading: boolean, data: T[]) => void;
}

export interface InfiniteListRef<T> {
  reload: () => void;
  getDataList: () => T[]; // Get current list data
}
