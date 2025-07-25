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
 * ahooks 的 useInfiniteScroll 返回的对象引用会变，本方法返回一个引用不变的对象，仅此而已，不用关注其声明和实现
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

  // 用一个引用不变的 req，便于 effect 中的 handler 拿到最新的 loading 状态
  // （将 loading 放进 effect 的 deps 中并不能解决问题，因为上一次的闭包中 getFavoritesList 前后的 loading 状态已经固定不会变了，导致上一次执行出错）
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
        // 处理竞态问题，优先保证列表滚动加载，下同
        return;
      }

      const currLength = req.data?.list?.length;
      const mutateData = await getFavoritesList({
        spaceId,
        spaceType,
        // Q：为什么要专门设置 pageSize
        // A：useInfiniteScroll 有个 bug/feature，mutate 后不会立即触发高度检测
        //  这要从它的 loadmore 触发逻辑讲起，正常是监听 scroll 动作，检测高度，从而判断是否需要 loadmore
        //  但假如首次请求回来的数据就不足一屏高度，没有 overflow 无法触发 scroll 动作，怎么办？
        //  因此 useInfiniteScroll 会在 run、reload 之类的行为完成后立即做一次高度检测来判断是否要继续 loadmore。
        //  但是！它却唯独不会在 mutate 后做高度检测，导致 mutate 出来的数据不足一屏，就再也无法 loadmore 了
        //  因此这里手动计算一下需要 mutate 的数据量。
        //  如果后续 pageSize 太大有问题，那还可以继续改造一下 useInfiniteScrollRef，使 mutate 动作实际执行 reload，但拦截其 loading 属性返回 false
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
      // 使用 mutate 静默加载，直接更新视图，不展示 loading 效果
      req.mutate(mutateData);
    };
    cozeMitt.on('refreshFavList', handler);
    return () => cozeMitt.off('refreshFavList', handler);
  }, [spaceId, spaceType]);

  return (
    // 这里有一个很坑，滚动蒙层如果直接挂在滚动画布元素上会一起滚动，所以这里需要单独包一层（往上方一层）
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
