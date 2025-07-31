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
  type ResponsiveTokenMap,
  type ScreenRange,
} from '@coze-arch/responsive-kit';
import { type ListProps } from '@coze-arch/bot-semi/List';

export interface EmptyProps {
  isError?: boolean;
  isLoading?: boolean;
  isSearching?: boolean;
  loadRetry?: () => void; //retry loading
  text?: {
    emptyTitle?: string;
    emptyDesc?: string;
    searchEmptyTitle?: string;
  };
  btn?: {
    emptyClick?: () => void; //
    emptyText?: string;
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
  nextPage: number;
  [key: string]: unknown;
}

export interface ScrollProps<T> {
  threshold?: number; //How far is it from below to start loading data?
  targetRef?: RefObject<HTMLDivElement>; // Listening for scrolling Dom references
  loadData: (current) => Promise<InfiniteListDataProps<T>>; // Load more data
  reloadDeps?: unknown[]; // Reloading data dependencies
  isNeedBtnLoadMore?: boolean;
  isLoading?: boolean; // Is it loading?
  resetDataIfReload?: boolean; // When reloading, whether to reset the existing data in the list first, the default is true
}

export interface InfiniteListProps<T>
  extends Pick<
    ListProps<T>,
    'className' | 'emptyContent' | 'grid' | 'renderItem'
  > {
  containerClassName?: string;
  canShowData?: boolean; //Can the data be displayed?
  isSearching?: boolean; // Whether it is in the search, it is mainly used for error display, select Copy to use
  itemClassName?: string | ((item: T) => string);
  isNeedBtnLoadMore?: boolean;
  isResponsive?: boolean;
  emptyConf: {
    renderEmpty?: EmptyProps['renderEmpty'];
    text?: EmptyProps['text'];
    btn?: EmptyProps['btn'];
    icon?: EmptyProps['icon'];
  };
  renderFooter?: FooterProps['renderFooter'];
  scrollConf: ScrollProps<T>;
  rowKey?: string;
  retryFunc?: () => void;
  onChangeState?: (loading, data) => void;
  responsiveConf?: {
    gridCols?: ResponsiveTokenMap<ScreenRange>;
  };
}

export interface InfiniteListRef {
  mutate: (data) => void;
  reload: () => void;
  insertData: (item, index) => void;
  removeData: (index) => void;
  getDataList: () => unknown[]; // Get current list data
}
