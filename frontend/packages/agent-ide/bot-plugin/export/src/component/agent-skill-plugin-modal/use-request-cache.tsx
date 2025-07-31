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

import { type MutableRefObject, useEffect } from 'react';

import { setCache, getCache, clearCache } from '@coze-arch/bot-utils';
import { type InfiniteListDataProps } from '@coze-community/components';
import {
  DEFAULT_PAGE_SIZE,
  MineActiveEnum,
  PluginFilterType,
  type CommonQuery,
  type ListItemCommon,
  type RequestServiceResp,
} from '@coze-agent-ide/plugin-shared';

interface Data {
  list: object[];
  total: number;
  hasMore?: boolean;
}
export interface InfiniteScrollViewportOptions<
  ListItem extends ListItemCommon,
  Query extends CommonQuery,
> {
  scrollContainer: MutableRefObject<HTMLDivElement | null>;
  query: Query;
  triggerService: (
    query: Query,
    commonParam: {
      nextPage: number;
      isMine: boolean;
      isTeam: boolean;
      isCreatorMine: boolean;
      isTemplate: boolean;
      isFavorite: boolean;
      isProject: boolean;
    },
  ) => Promise<RequestServiceResp<ListItem> | undefined>;
  // @ts-expect-error -- linter-disable-autofix
  onSetScrollData: (scrollData) => void;
  formatCacheKey: (query: {
    query: Query;
    isSearching: boolean;
    isTemplate: boolean;
    page: number;
  }) => string | undefined;
}

const DEFAULT_CACHE_TIME = 300000;

export function useInfiniteScrollCacheLoad<
  ListItem extends ListItemCommon,
  Query extends CommonQuery,
>({
  scrollContainer,
  query,
  triggerService,
  formatCacheKey,
  onSetScrollData,
}: InfiniteScrollViewportOptions<ListItem, Query>) {
  const { search, type, mineActive } = query;
  const isSearching = search !== '';
  // my tools
  const isMine = type === PluginFilterType.Mine;
  // team tools
  const isTeam = type === PluginFilterType.Team;
  const isFavorite = type === PluginFilterType.Favorite;
  const isProject = type === PluginFilterType.Project;

  // team tools -> my creator
  const isCreatorMine = mineActive === MineActiveEnum.Mine;
  const isTemplate = Number(type) >= 0 || type === 'recommend';

  const scroll2Top = () => {
    if (scrollContainer.current) {
      scrollContainer.current.scrollTo({
        top: 0,
      });
    }
  };

  const onBeforeLoadData = (
    // @ts-expect-error -- linter-disable-autofix
    current,
    cachedKey: string,
    isImmediateUpdate: boolean,
  ) => {
    const res = getCache(cachedKey);
    if (!cachedKey || !res) {
      return false;
    }
    const { data } = res;
    if (!isImmediateUpdate) {
      return res.data;
    }

    const currentPage = current?.nextPage || 1;
    const { list, total } = (data as Data) || { list: [], total: 0 };
    const hasMore = total > 0 && currentPage * DEFAULT_PAGE_SIZE < total;
    onSetScrollData({
      ...current,
      hasMore,
      list: [...(currentPage?.list || []), ...list],
    });
    return false;
  };

  const setCacheData = <TData,>(
    cachedKey: string,
    cacheTime: number,
    res: TData,
  ) => {
    if (!cachedKey) {
      return;
    }
    setCache(cachedKey, cacheTime, {
      time: Date.now(),
      data: res,
    });
  };

  const loadData = async (current: InfiniteListDataProps<ListItem>) => {
    const currentPage = current?.nextPage || 1;
    let cachedKey =
      formatCacheKey({ query, isSearching, isTemplate, page: currentPage }) ||
      '';
    if (!isMine && !isTeam) {
      cachedKey = '';
    }
    let res = onBeforeLoadData(current, cachedKey, !isTemplate);

    if (!res) {
      res = await triggerService(query, {
        nextPage: currentPage,
        isMine,
        isTeam,
        isCreatorMine,
        isTemplate,
        isFavorite,
        isProject,
      });
      setCacheData(cachedKey, DEFAULT_CACHE_TIME, res);
    }

    const { list, hasMore } = (res as InfiniteListDataProps<ListItem>) || {
      list: [],
      total: 0,
    };
    const nextPage = currentPage + 1;
    const refIdList = {};
    (current?.list || []).map(item => {
      // @ts-expect-error -- linter-disable-autofix
      refIdList[
        (item as unknown as { pluginInfo: { id: string } })?.pluginInfo?.id
      ] = true;
    });

    //Data deduplicated
    const uniqList = (list || []).filter(item => {
      const pluginId = (item as unknown as { pluginInfo: { id: string } })
        ?.pluginInfo?.id;
      if (pluginId) {
        // @ts-expect-error -- linter-disable-autofix
        if (refIdList[pluginId]) {
          return false;
        }
      }
      return true;
    });

    return {
      list: uniqList || [],
      hasMore,
      nextPage,
    };
  };

  useEffect(() => {
    clearCache();
  }, []);
  return {
    scroll2Top,
    isSearching,
    loadData,
    isFavorite,
    isTemplate,
    isMine,
    isTeam,
    isProject,
  };
}
