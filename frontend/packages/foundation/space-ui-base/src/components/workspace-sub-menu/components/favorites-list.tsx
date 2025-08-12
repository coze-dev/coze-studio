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

import { type FC, useRef, useEffect, useMemo } from 'react';

import { useShallow } from 'zustand/react/shallow';
import classNames from 'classnames';
import { useInfiniteScroll } from 'ahooks';
import { reporter } from '@coze-arch/logger';
import {
  type Intelligence,
  IntelligenceStatus,
  SearchScope,
  search,
} from '@coze-arch/idl/intelligence_api';
import { I18n } from '@coze-arch/i18n';
import { type SpaceType } from '@coze-arch/bot-api/developer_api';
import { intelligenceApi } from '@coze-arch/bot-api';
import { useSpaceStore } from '@coze-foundation/space-store';
import { cozeMitt, type RefreshFavListParams } from '@coze-common/coze-mitt';
import { CustomError } from '@coze-arch/bot-error';
import { Space, Loading } from '@coze-arch/coze-design';

import { FavoritesListItem } from './favorites-list-item';

interface FEIntelligenceListData {
  list: Intelligence[];
  total: number;
  hasMore: boolean;
  cursorId?: string;
}

const emptyDraftBotListData: FEIntelligenceListData = {
  list: [],
  total: 0,
  hasMore: false,
  cursorId: undefined,
};

const DEFAULT_PAGE_SIZE = 20;

const getFavoritesList = async ({
  spaceId,
  spaceType,
  cursorId,
  pageSize = DEFAULT_PAGE_SIZE,
}: {
  spaceId?: string;
  spaceType?: SpaceType;
  cursorId?: string;
  pageSize?: number;
}): Promise<FEIntelligenceListData> => {
  try {
    if (spaceId) {
      const res = await intelligenceApi.GetDraftIntelligenceList({
        space_id: spaceId,
        order_by: search.OrderBy.UpdateTime,
        is_fav: true,
        status: [
          IntelligenceStatus.Using,
          IntelligenceStatus.Banned,
          IntelligenceStatus.MoveFailed,
        ],
        size: pageSize,
        cursor_id: cursorId,
        search_scope: SearchScope.All,
      });
      const resData = res?.data;
      return {
        list: resData?.intelligences || [],
        total: resData?.total ?? 0,
        hasMore: Boolean(resData?.has_more),
        cursorId: resData?.next_cursor_id,
      };
    } else {
      return emptyDraftBotListData;
    }
  } catch (error) {
    reporter.errorEvent({
      eventName: 'get_favorites_list_error',
      error: new CustomError(
        'get_favorites_list_error',
        (error as Error).message,
      ),
    });
    return emptyDraftBotListData;
  }
};

/**
 * The object reference returned by the useInfiniteScroll of ahooks will change. This method returns an object with unchanged references, nothing more, regardless of its declaration and implementation
 */
const useInfiniteScrollRef: typeof useInfiniteScroll = <
  T extends { list: unknown[] },
>(
  ...params: Parameters<typeof useInfiniteScroll<T>>
) => {
  const req = useInfiniteScroll<T>(...params);
  const reqRef = useMemo(() => ({ ...req }), []);
  return Object.assign(reqRef, req);
};

export const FavoritesList: FC = () => {
  const { spaceId, spaceType } = useSpaceStore(
    useShallow(store => ({
      spaceId: store.space.id,
      spaceType: store.space.space_type,
    })),
  );

  const containerRef = useRef<HTMLDivElement>(null);

  // Use an invariant req to make it easier for the handler in the effect to get the latest loading status
  // (Putting loading into the deps of effect doesn't solve the problem, because the loading state before and after getFavoritesList in the last closure has been fixed and will not change, resulting in an error in the last execution)
  const req = useInfiniteScrollRef<FEIntelligenceListData>(
    async dataSource =>
      await getFavoritesList({
        spaceId,
        spaceType,
        cursorId: dataSource?.cursorId ?? undefined,
      }),
    {
      target: containerRef,
      reloadDeps: [spaceId, spaceType],
      isNoMore: dataSource => !dataSource?.hasMore,
    },
  );
  const { loading, data, loadingMore } = req;

  useEffect(() => {
    const handler = async (refreshFavListParams: RefreshFavListParams) => {
      if (req.loading || req.loadingMore) {
        // Deal with the race problem, give priority to ensuring the rolling loading of the list, the same as below
        return;
      }

      const currLength = req.data?.list?.length;
      const mutateData = await getFavoritesList({
        spaceId,
        spaceType,
        // Q: Why set the pageSize specifically?
        // A: useInfiniteScroll has a bug/feature that does not trigger height detection immediately after mutating
        //  This starts with its loadmore trigger logic. Normally, it monitors the scroll action and detects the height to determine whether loadmore is required.
        //  But what if the data requested for the first time is less than one screen height, and the scroll action cannot be triggered without overflow?
        //  Therefore, useInfiniteScroll will perform a height check immediately after running, reloading, etc. to determine whether to continue loadmore.
        //  However! It will not do height detection after mutating, resulting in less than one screen of mutated data, and it can no longer loadmore
        //  So here we manually calculate the amount of data that needs to be mutated.
        //  If there is a problem with the subsequent pageSize being too large, you can continue to modify the useInfiniteScrollRef so that the mutate action actually executes reload, but intercepts its loading property and returns false.
        pageSize: Math.max(
          currLength
            ? currLength + refreshFavListParams.numDelta
            : DEFAULT_PAGE_SIZE,
          DEFAULT_PAGE_SIZE,
        ),
      });
      if (req.loading || req.loadingMore) {
        return;
      }
      // Use mutate silent loading to update the view directly without displaying the loading effect
      req.mutate(mutateData);
    };
    cozeMitt.on('refreshFavList', handler);
    return () => cozeMitt.off('refreshFavList', handler);
  }, [spaceId, spaceType]);

  return (
    // There is a very pit here. If the scrolling overlay is directly hung on the scrolling canvas element, it will scroll together, so it needs to be wrapped in a separate layer (one layer above).
    <div className={classNames('w-full h-full flex flex-col')}>
      <>
        <Space
          className="h-[24px] pl-[8px] w-full mb-[4px] flex-none"
          spacing={4}
        >
          <div className="coz-fg-secondary text-[14px] font-[500] leading-[20px]">
            {I18n.t('navigation_workspace_favourites', {}, 'Favourites')}
          </div>
        </Space>
        <div
          ref={containerRef}
          className="w-full flex-grow max-h-full overflow-y-auto styled-scrollbar-hidden"
        >
          {loading ? (
            <div className="flex items-center justify-center h-[200px] w-full">
              <Loading loading={true} size="mini" />
            </div>
          ) : (
            <Space vertical spacing={4} className="w-full">
              {data?.list?.length && data?.list?.length > 0 ? (
                data?.list?.map(intelligenceData => (
                  <FavoritesListItem
                    key={intelligenceData.basic_info?.id}
                    {...intelligenceData}
                  />
                ))
              ) : (
                <div className="coz-fg-dim pl-[8px] text-[14px] font-[500] leading-[20px]">
                  <div>{I18n.t('home_favor_desc1')}</div>
                  <div>{I18n.t('home_favor_desc2')}</div>
                </div>
              )}
              {loadingMore ? <Loading loading={true} size="mini" /> : null}
            </Space>
          )}
        </div>
      </>
    </div>
  );
};
