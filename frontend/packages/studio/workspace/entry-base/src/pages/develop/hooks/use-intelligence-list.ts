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

import { useEffect, useRef } from 'react';

import axios, { type CancelTokenSource } from 'axios';
import { type InfiniteScrollOptions } from 'ahooks/lib/useInfiniteScroll/types';
import { useInfiniteScroll } from 'ahooks';
import { withSlardarIdButton } from '@coze-studio/bot-utils';
import {
  createReportEvent,
  REPORT_EVENTS as ReportEventNames,
} from '@coze-arch/report-events';
import { logger } from '@coze-arch/logger';
import {
  IntelligenceStatus,
  type IntelligenceType,
  type search,
  type SearchScope,
} from '@coze-arch/idl/intelligence_api';
import { I18n } from '@coze-arch/i18n';
import { Toast } from '@coze-arch/coze-design';
import { intelligenceApi } from '@coze-arch/bot-api';

import { type DraftIntelligenceList } from '../type';

const pageSize = 24;

export interface FilterParamsType {
  types: IntelligenceType[];
  spaceId: string;
  hasPublished?: boolean;
  searchValue?: string;
  recentlyOpen?: boolean;
  searchScope?: SearchScope;
  orderBy: search.OrderBy;
}

const getIntelligenceList = async (
  dataSource: DraftIntelligenceList | undefined,
  {
    spaceId,
    types,
    searchValue,
    hasPublished,
    recentlyOpen,
    searchScope,
    orderBy,
  }: FilterParamsType,
  cancelTokenRef: React.MutableRefObject<CancelTokenSource | null>,
) => {
  // Reset the cancel token every time a new request is made.
  const source = axios.CancelToken.source();
  cancelTokenRef.current = source;
  const resp = await intelligenceApi
    .GetDraftIntelligenceList(
      {
        space_id: spaceId,
        name: searchValue,
        types,
        size: pageSize,
        has_published: hasPublished,
        recently_open: recentlyOpen,
        cursor_id: dataSource?.nextCursorId,
        search_scope: searchScope,
        // Fixed value, from historical code
        order_by: orderBy,
        status: [
          IntelligenceStatus.Using,
          IntelligenceStatus.Banned,
          IntelligenceStatus.MoveFailed,
        ],
      },
      { cancelToken: source.token, __disableErrorToast: true },
    )
    .catch(e => {
      if (e.message !== 'canceled') {
        Toast.error({
          content: withSlardarIdButton(e.msg || e.message || I18n.t('error')),
          showClose: false,
        });
      }
    });

  if (resp?.data) {
    return {
      list: resp.data.intelligences ?? [],
      hasMore: Boolean(resp.data.has_more),
      nextCursorId: resp.data.next_cursor_id,
    };
  } else {
    return {
      list: [],
      hasMore: false,
      nextCursorId: undefined,
    };
  }
};

const buildBotLogger = logger.createLoggerWith({
  ctx: {
    namespace: 'bot_list',
  },
});

const getBotListReportEvent = createReportEvent({
  eventName: ReportEventNames.getBotList,
  logger: buildBotLogger,
});

export const useIntelligenceList = ({
  params: {
    spaceId,
    types,
    searchValue,
    hasPublished,
    recentlyOpen,
    searchScope,
    orderBy,
  },
  onBefore,
  onSuccess,
  onError,
}: {
  params: FilterParamsType;
} & Pick<
  InfiniteScrollOptions<DraftIntelligenceList>,
  'onBefore' | 'onSuccess' | 'onError'
>) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cancelTokenRef = useRef<CancelTokenSource | null>(null);

  const listResp = useInfiniteScroll<DraftIntelligenceList>(
    async dataSource =>
      await getIntelligenceList(
        dataSource,
        {
          spaceId,
          types,
          searchValue,
          hasPublished,
          recentlyOpen,
          searchScope,
          orderBy,
        },
        cancelTokenRef,
      ),
    {
      target: containerRef,
      reloadDeps: [
        types.join(','),
        searchValue,
        hasPublished,
        recentlyOpen,
        searchScope,
        orderBy,
        spaceId,
      ],
      isNoMore: dataSource => !dataSource?.hasMore,
      onBefore: () => {
        if (listResp.loadingMore || listResp.loading) {
          cancelTokenRef.current?.cancel();
        }
        getBotListReportEvent.start();
        onBefore?.();
      },
      onSuccess: (...res) => {
        getBotListReportEvent.success();
        onSuccess?.(...res);
      },
      onError: e => {
        getBotListReportEvent.error({
          error: e,
          reason: e.message,
        });
        onError?.(e);
      },
    },
  );

  useEffect(
    () => () => {
      // Cancel the requested interface
      cancelTokenRef.current?.cancel();
    },
    [spaceId],
  );

  return { listResp, containerRef, cancelTokenRef };
};
