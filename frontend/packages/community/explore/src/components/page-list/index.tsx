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

import { type FC } from 'react';

import { useRequest } from 'ahooks';
import { type ProductInfo } from '@coze-studio/api-schema/marketplace';
import { I18n } from '@coze-arch/i18n';
import { IconCozIllusError } from '@coze-arch/coze-design/illustrations';
import { EmptyState } from '@coze-arch/coze-design';

import styles from './index.module.less';

export enum PluginCateTab {
  Local = 'local',
  Coze = 'coze',
}

export const PageList: FC<{
  title: React.ReactNode;
  type?: PluginCateTab;
  renderCard: (cardData: ProductInfo) => React.ReactNode;
  renderCardSkeleton: () => React.ReactNode;
  getDataList: (type?: PluginCateTab) => Promise<unknown[]>;
  customFilters?: React.ReactNode;
}> = ({
  title,
  type,
  renderCard,
  getDataList,
  renderCardSkeleton,
  customFilters,
}) => {
  const {
    data: cardList,
    loading,
    error,
    refresh,
  } = useRequest(
    async () => {
      const dataList = await getDataList(type);
      return dataList;
    },
    { refreshDeps: [type] },
  );

  return (
    <div className={styles['explore-list-container']}>
      {title}

      {customFilters}

      {error && !loading ? (
        <EmptyState
          size="full_screen"
          icon={<IconCozIllusError className="coz-fg-dim text-32px" />}
          title={I18n.t('inifinit_list_load_fail')}
          buttonText={I18n.t('inifinit_list_retry')}
          onButtonClick={() => {
            refresh();
          }}
        />
      ) : (
        <div className="grid grid-cols-3 auto-rows-min gap-[20px] [@media(min-width:1600px)]:grid-cols-4 pl-[24px] pr-[24px] pb-[8px]">
          {loading
            ? new Array(20).fill(0).map((_, index) => renderCardSkeleton?.())
            : cardList?.map(item => renderCard(item as ProductInfo))}
        </div>
      )}
    </div>
  );
};
