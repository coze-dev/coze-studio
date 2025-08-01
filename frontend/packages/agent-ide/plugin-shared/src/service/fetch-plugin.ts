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

import qs from 'qs';
import { useSpaceStore } from '@coze-foundation/space-store';
import {
  type Int64,
  ProductEntityType,
  type ProductInfo,
  type public_api,
  ProductListSource,
  type CommercialSetting,
} from '@coze-arch/bot-api/product_api';
import {
  type PluginInfoForPlayground,
  PluginType,
} from '@coze-arch/bot-api/plugin_develop';
// import { type PluginInfoForPlayground } from '@coze-arch/bot-api/developer_api';
import { ProductApi, PluginDevelopApi } from '@coze-arch/bot-api';

import { type RequestServiceResp } from '../types/plugin-modal-types';
import { type AuthMode } from '../types/auth-mode';
import { DEFAULT_PAGE_SIZE } from '../constants/plugin-modal-constants';

type ProductMetaInfo = public_api.ProductMetaInfo;
type PluginExtraInfo = public_api.PluginExtraInfo;

export type SimplifyProductInfo = Pick<
  ProductMetaInfo,
  | 'id'
  | 'category'
  | 'entity_type'
  | 'favorite_count'
  | 'heat'
  | 'is_favorited'
  | 'is_free'
  | 'status'
  | 'listed_at'
  | 'user_info'
> & { favorite_time: string; version_name?: string } & PluginExtraInfo &
  AuthMode;

export interface PluginContentListItem {
  productInfo?: SimplifyProductInfo;
  pluginInfo: PluginInfoForPlayground;
  belong_page?: number;
  isFromMarket?: boolean; //Where is the data obtained from?
  commercial_setting?: CommercialSetting;
}

const filterProductListParams = (key: string, value: unknown) => {
  const keyMap: {
    [K in keyof Pick<
      Required<public_api.GetProductListRequest>,
      'current_entity_id' | 'current_entity_version'
    >]: K;
  } = {
    current_entity_id: 'current_entity_id',
    current_entity_version: 'current_entity_version',
  };
  if (!(key in keyMap)) {
    return value;
  }
  // The keyMap key corresponds to the value stringifyNumber to filter out illegal values "'
  if (value === '') {
    return;
  }
  return value;
};

function formatPluginApiProductInfo(productInfo: ProductInfo) {
  const name = productInfo?.meta_info?.name;
  const pluginId = `${productInfo?.meta_info?.entity_id || ''}`;
  const apiList = productInfo?.plugin_extra?.tools;
  return apiList?.map(item => ({
    api_id: `${item?.id || ''}`,
    desc: item?.description,
    name: item?.name,
    plugin_id: pluginId,
    plugin_name: name,
    record_id: '',
    // Plugin preset card information
    card_binding_info: {
      thumbnail: item?.card_info?.card_url,
    },
    parameters: item?.parameters?.map(param => ({
      name: param?.name,
      desc: param?.description,
      required: param?.required,
      type: param?.type,
      sub_params: param?.sub_params,
    })),
    debug_example: item?.example,
  }));
}

function formatPluginProductInfo(
  item: ProductInfo,
  currentPage: number,
  favoriteTime: Int64 = '',
): PluginContentListItem {
  return {
    productInfo: {
      id: String(item?.meta_info?.id),
      category: item?.meta_info?.category,
      entity_type: item?.meta_info?.entity_type,
      favorite_count: item?.meta_info?.favorite_count,
      heat: item?.meta_info?.heat,
      is_favorited: item?.meta_info?.is_favorited,
      is_free: item?.meta_info?.is_free,
      favorite_time: String(favoriteTime || ''),
      status: item?.meta_info?.status,
      listed_at: item?.meta_info?.listed_at,
      user_info: item.meta_info.user_info,
      ...item.plugin_extra,
    },
    pluginInfo: {
      name: item?.meta_info?.name,
      plugin_apis: formatPluginApiProductInfo(item),
      id: `${item?.meta_info?.entity_id || ''}`,
      plugin_icon: item?.meta_info?.icon_url,
      desc_for_human: item?.meta_info?.description,
      creator: {
        id: `${item?.meta_info?.user_info?.user_id || ''}`,
        name: item?.meta_info?.user_info?.name,
        avatar_url: item?.meta_info?.user_info?.avatar_url,
      },
      statistic_data: {
        bot_quote: item?.plugin_extra?.bots_use_count || 0,
      },
      tag: item?.meta_info?.category?.id,
    },
    isFromMarket: true,
    belong_page: currentPage,

    commercial_setting: item.commercial_setting,
  };
}

// Pull, Plugin Market, Plugin Product List
async function getPluginFromMarket(
  // @ts-expect-error -- linter-disable-autofix
  queryParams,
  // @ts-expect-error -- linter-disable-autofix
  commParams,
): Promise<RequestServiceResp<PluginContentListItem> | undefined> {
  const { nextPage } = commParams;

  const {
    search,
    type,
    orderByPublic,
    botInfo = {},
    isOfficial,
    pluginType,
  } = queryParams;

  const res = await ProductApi.PublicGetProductList(
    {
      entity_type: ProductEntityType.Plugin,
      category_id: type === 'recommend' || IS_OPEN_SOURCE ? undefined : type,
      sort_type: orderByPublic,
      page_num: nextPage,
      page_size: 20,
      keyword: search,
      source:
        type === 'recommend'
          ? ProductListSource.CustomizedRecommend
          : undefined,
      is_official: isOfficial,
      plugin_type: pluginType,
      ...botInfo,
    },
    {
      paramsSerializer: p =>
        qs.stringify(p, {
          filter: filterProductListParams,
        }),
    },
  );
  const list = (res?.data?.products || []).map(item =>
    formatPluginProductInfo(item, nextPage),
  );
  const hasMore = (list.length > 0 && res?.data?.has_more) || false;
  return {
    list,
    total: -1,
    hasMore,
  };
}

async function getPluginFromFavorite(
  // @ts-expect-error -- linter-disable-autofix
  queryParams,
  // @ts-expect-error -- linter-disable-autofix
  commParams,
): Promise<RequestServiceResp<PluginContentListItem> | undefined> {
  const { nextPage } = commParams;

  const { search, orderByFavorite } = queryParams;
  const res = await ProductApi.PublicGetUserFavoriteList({
    entity_type: ProductEntityType.Plugin,
    sort_type: orderByFavorite,
    page_num: nextPage,
    page_size: 20,
    key_wrod: search,
  });
  const list = (res?.data?.favorite_products || [])?.map(item =>
    formatPluginProductInfo(
      item.product,
      nextPage,
      `${item?.created_at || ''}`,
    ),
  );
  const hasMore = (list.length > 0 && res?.data?.has_more) || false;
  return {
    list,
    total: -1,
    hasMore,
  };
}
function getPluginFromMinOrTeam(
  // @ts-expect-error -- linter-disable-autofix
  queryParams,
  // @ts-expect-error -- linter-disable-autofix
  commParams,
): Promise<RequestServiceResp<PluginContentListItem> | undefined> {
  const { isMine, isTeam, isCreatorMine, isTemplate, nextPage } = commParams;
  const pluginTypes = [PluginType.PLUGIN, PluginType.APP, PluginType.LOCAL];

  const { search, orderByPublic, orderBy } = queryParams;
  const params = {
    page: nextPage || 1,
    size: DEFAULT_PAGE_SIZE,
    name: search || void 0,
    self_created: isMine || (isTeam && isCreatorMine) ? true : undefined,
    order_by: isTemplate ? orderByPublic : orderBy,
    plugin_types: pluginTypes,
    space_id: useSpaceStore.getState().getSpaceId(),
    channel_id: 1,
  };

  return PluginDevelopApi.GetPlaygroundPluginList(params).then(res => {
    const list =
      res.data?.plugin_list?.map(item => ({
        pluginInfo: item,
        isFromMarket: false,
        // The current data belongs to the data of the page, which is used for page data replacement
        // If you replace page + size with id + count later, you can remove this logic.
        belong_page: nextPage,
      })) || [];
    const hasMore =
      list.length > 0 && nextPage * DEFAULT_PAGE_SIZE < Number(res.data?.total);
    return {
      list,
      total: -1,
      hasMore,
    };
  });
}

async function getPluginFromProject(
  // @ts-expect-error -- linter-disable-autofix
  queryParams,
  // @ts-expect-error -- linter-disable-autofix
  commParams,
): Promise<RequestServiceResp<PluginContentListItem> | undefined> {
  const { nextPage } = commParams;
  const { search, projectId, devId, orderBy } = queryParams;
  const res = await PluginDevelopApi.GetDevPluginList({
    page: nextPage,
    size: DEFAULT_PAGE_SIZE,
    space_id: useSpaceStore.getState().getSpaceId(),
    name: search,
    dev_id: devId,
    project_id: projectId,
    order_by: orderBy,
  });
  const list = (res?.plugin_list || [])?.map(item => ({
    pluginInfo: item,
    isFromMarket: false,
    belong_page: nextPage,
  }));
  const hasMore =
    list.length > 0 && nextPage * DEFAULT_PAGE_SIZE < Number(res?.total);
  return {
    list,
    total: -1,
    hasMore,
  };
}

// @ts-expect-error -- linter-disable-autofix
export const fetchPlugin = (queryParams, commParams) => {
  const { isMine, isTeam, isFavorite, isProject } = commParams;
  console.log('[div] params:', queryParams, commParams);
  if (isMine || isTeam) {
    return getPluginFromMinOrTeam(queryParams, commParams);
  } else if (isFavorite) {
    return getPluginFromFavorite(queryParams, commParams);
  } else if (isProject) {
    return getPluginFromProject(queryParams, commParams);
  }
  return getPluginFromMarket(queryParams, commParams);
};

// @ts-expect-error -- linter-disable-autofix
export const formatCacheKey = ({ query, isSearching, isTemplate, page }) => {
  const { orderBy, orderByPublic, type, mineActive } = query;
  if (isSearching) {
    return;
  }
  if (isTemplate) {
    return `plugin-${type}-${page}-${orderByPublic}`;
  }
  return `plugin-${type}-${page}-${orderBy}-${mineActive}`;
};
