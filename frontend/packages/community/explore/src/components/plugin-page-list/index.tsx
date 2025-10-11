/* eslint-disable @coze-arch/tsx-no-leaked-render */
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

import { type FC, useState, useRef, useEffect } from 'react';

import { useInfiniteScroll, useInViewport } from 'ahooks';
import { type ProductInfo } from '@coze-studio/api-schema/marketplace';
import { type explore } from '@coze-studio/api-schema';
import { I18n } from '@coze-arch/i18n';
import { IconCozIllusError } from '@coze-arch/coze-design/illustrations';
import { EmptyState } from '@coze-arch/coze-design';

import styles from './index.module.less';

export enum PluginCateTab {
  Local = 'local',
  Coze = 'coze',
}
export interface TaskListServiceRes {
  list: explore.ProductInfo[];
  page: number;
  has_more: boolean;
}

function LoadMoreTrigger({ onLoadMore }: { onLoadMore: () => void }) {
  const divRef = useRef<HTMLDivElement>(null);
  const [isInView] = useInViewport(divRef);

  useEffect(() => {
    if (!isInView) {
      return;
    }
    onLoadMore?.();
  }, [isInView]);

  return <div ref={divRef} style={{ height: 1 }} />;
}

export const PageList: FC<{
  title: React.ReactNode;
  type?: PluginCateTab;
  renderCard: (cardData: ProductInfo) => React.ReactNode;
  renderCardSkeleton: () => React.ReactNode;
  getDataList: (
    type?: PluginCateTab,
    curData?: TaskListServiceRes,
  ) => Promise<TaskListServiceRes>;
  customFilters?: React.ReactNode;
}> = ({
  title,
  type,
  renderCard,
  getDataList,
  renderCardSkeleton,
  customFilters,
}) => {
  const [loadFailed, setLoadFailed] = useState(false);

  const {
    data: cardList,
    loading,
    loadMore,
    reload,
  } = useInfiniteScroll(
    async (curData?: TaskListServiceRes) => await getDataList(type, curData),
    {
      reloadDeps: [type],
      isNoMore: d => !d?.has_more,
      onFinally: d => {
        setLoadFailed(!d?.list.length);
      },
    },
  );

  return (
    <div className={styles['explore-list-container']}>
      {title}

      {customFilters}

      {loadFailed && !loading ? (
        <EmptyState
          size="full_screen"
          icon={<IconCozIllusError className="coz-fg-dim text-32px" />}
          title={I18n.t('inifinit_list_load_fail')}
          buttonText={I18n.t('inifinit_list_retry')}
          onButtonClick={() => {
            reload();
          }}
        />
      ) : (
        <div className="grid grid-cols-3 auto-rows-min gap-[20px] [@media(min-width:1600px)]:grid-cols-4 pl-[24px] pr-[24px] pb-[8px]">
          {loading
            ? new Array(20).fill(0).map((_, index) => renderCardSkeleton?.())
            : cardList?.list?.map(item => renderCard(item as ProductInfo))}
          {cardList?.has_more && (
            <LoadMoreTrigger
              onLoadMore={() => {
                if (!loading) {
                  loadMore();
                }
              }}
            />
          )}
        </div>
      )}
    </div>
  );
};
