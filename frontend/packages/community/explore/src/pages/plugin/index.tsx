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

import { useRequest } from 'ahooks';
import { explore } from '@coze-studio/api-schema';
import {
  PluginCard,
  type PluginCardProps,
  PluginCardSkeleton,
} from '@coze-community/components';
import { SearchInput, useUsageModal } from '@coze-community/components';
import { I18n } from '@coze-arch/i18n';
import { TabBar, Button } from '@coze-arch/coze-design';
import { ProductEntityType } from '@coze-arch/bot-api/product_api';
import useUrlState from '@ahooksjs/use-url-state';

import {
  PageList,
  PluginCateTab,
  type TaskListServiceRes,
} from '../../components/plugin-page-list';

const { TabPanel } = TabBar;

const entityTypeMap = {
  [PluginCateTab.Local]: ProductEntityType.Plugin,
  [PluginCateTab.Coze]: ProductEntityType.SaasPlugin,
};

export const PluginPage = () => {
  const { node: usageInvokeModal, open: openUsageInvokeModal } = useUsageModal(
    {},
  );

  const { data: enableSaaSPlugin } = useRequest(async () => {
    const res = await explore.PublicGetMarketPluginConfig({});
    return res.data?.enable_saas_plugin || false;
  });

  const [{ tab }, setState] = useUrlState<{ tab: PluginCateTab }>(
    {
      tab: PluginCateTab.Local,
    },
    {
      navigateMode: 'replace',
    },
  );

  const customFilters = (
    <div className="flex justify-between items-center mt-[12px] mx-[24px]">
      <TabBar
        tabBarClassName="mb-[20px]"
        type="button"
        activeKey={tab}
        onChange={newTab => {
          setState({ tab: newTab as PluginCateTab });
        }}
      >
        <TabPanel tab="本地插件" itemKey={PluginCateTab.Local} />
        {enableSaaSPlugin ? (
          <TabPanel tab="Coze插件" itemKey={PluginCateTab.Coze} />
        ) : null}
      </TabBar>
      {tab === PluginCateTab.Coze ? (
        <Button
          className="mx-[24px]"
          onClick={() => {
            openUsageInvokeModal();
          }}
        >
          用量查看
        </Button>
      ) : (
        <Button
          className="mx-[24px]"
          onClick={() => {
            window.open('https://www.coze.cn/open/docs/guides', '_blank');
          }}
        >
          配置 coze.cn 插件
        </Button>
      )}
    </div>
  );

  return (
    <>
      <PageList
        title={
          <div className="flex justify-between items-center">
            <h2 className="leading-[72px] text-[20px] m-[0] pl-[24px] pr-[24px]">
              {I18n.t('Plugins')}
            </h2>
            {tab === PluginCateTab.Coze && (
              <>
                <SearchInput border entityType={ProductEntityType.Plugin} />
                <div className="w-[88px]" />
              </>
            )}
          </div>
        }
        type={tab}
        getDataList={getPluginData}
        customFilters={customFilters}
        renderCard={data => <PluginCard {...(data as PluginCardProps)} />}
        renderCardSkeleton={() => <PluginCardSkeleton />}
      />
      {usageInvokeModal}
    </>
  );
};

const PAGE_SIZE = 20;

// 滚动加载
const getPluginData = async (
  tab?: PluginCateTab,
  curData?: TaskListServiceRes,
): Promise<TaskListServiceRes> => {
  const reqPageNum = curData ? curData.page + 1 : 1;

  const res = await explore.PublicGetProductList({
    entity_type: entityTypeMap[tab || PluginCateTab.Local],
    sort_type: explore.product_common.SortType.Newest,
    page_num: reqPageNum,
    page_size: PAGE_SIZE,
  });
  const { products = [], has_more = false } = res.data || {};

  return {
    list: products,
    page: reqPageNum,
    has_more,
  };
};
