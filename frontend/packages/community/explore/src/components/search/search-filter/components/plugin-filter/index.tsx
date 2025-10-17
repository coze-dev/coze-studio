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

import React, { useEffect } from 'react';

import { useShallow } from 'zustand/react/shallow';
import { I18n } from '@coze-arch/i18n';
import { Space } from '@coze-arch/coze-design';
import {
  PluginType,
  ProductEntityType,
  ProductPaidType,
} from '@coze-arch/bot-api/product_api';
import { ProductApi } from '@coze-arch/bot-api';

import {
  OFFICIAL_VALUE,
  LOCAL_PLUGIN_VALUE,
  PAID_PLUGIN_VALUE,
} from '../../constant';
import { FilterGroupCheckbox, Divider } from '../../../filter-group';
// eslint-disable-next-line @coze-arch/no-deep-relative-import
import { useSearchStore } from '../../../../../pages/search/search-store';

import styles from './index.module.less';

// const { GetCate } = DeveloperApi;

const getFilterOption = () => {
  const options = [
    {
      value: OFFICIAL_VALUE,
      text: I18n.t('store_search_official_plugin_only'),
    },
  ];
  if (!IS_OVERSEA) {
    options.unshift({
      value: PAID_PLUGIN_VALUE,
      text: I18n.t('only_show_paid_plugins'),
    });
  }
  return options;
};

export const PluginFilter = () => {
  const {
    searchFilter,
    updateSearchFilter,
    setFilterConfig,
    filterConfig,
    setIsClear,
  } = useSearchStore(
    useShallow(state => ({
      updateSearchFilter: state.updateSearchFilter,
      searchFilter: state.searchFilter,
      setFilterConfig: state.setFilterConfig,
      filterConfig: state.filterConfig,
      setIsClear: state.setIsClear,
    })),
  );
  const categoryIds = filterConfig[ProductEntityType.Plugin]?.categoryIds || [];
  useEffect(() => {
    if (categoryIds?.length > 0) {
      return;
    }
    (async () => {
      const res = await ProductApi.PublicGetProductCategoryList({
        entity_type: ProductEntityType.Plugin,
      });

      setFilterConfig(ProductEntityType.Plugin, {
        categoryIds: res?.data?.categories ?? [],
      });
    })();
  }, []);

  useEffect(() => {
    const isClear =
      !searchFilter[ProductEntityType.Plugin].is_official &&
      !searchFilter[ProductEntityType.Plugin].plugin_type &&
      (searchFilter[ProductEntityType.Plugin].category_ids?.length || 0) === 0;

    setIsClear(isClear);
  }, [searchFilter]);

  const getSearchFilterValue = () => {
    const value: number[] = [];
    if (searchFilter[ProductEntityType.Plugin].is_official) {
      value.push(OFFICIAL_VALUE);
    }
    if (
      searchFilter[ProductEntityType.Plugin].plugin_type ===
      PluginType.LocalPlugin
    ) {
      value.push(LOCAL_PLUGIN_VALUE);
    }
    if (
      searchFilter[ProductEntityType.Plugin].product_paid_type ===
      ProductPaidType.Paid
    ) {
      value.push(PAID_PLUGIN_VALUE);
    }
    return value;
  };
  return (
    <Space spacing={0} vertical className={styles.container}>
      <FilterGroupCheckbox
        title=""
        checkList={getFilterOption()}
        onClick={value => {
          updateSearchFilter(ProductEntityType.Plugin, {
            is_official: value.includes(OFFICIAL_VALUE) ? true : undefined,
            plugin_type: value.includes(LOCAL_PLUGIN_VALUE)
              ? PluginType.LocalPlugin
              : undefined,
            product_paid_type: value.includes(PAID_PLUGIN_VALUE)
              ? ProductPaidType.Paid
              : undefined,
          });
        }}
        value={getSearchFilterValue()}
      />
      <Divider />
      <FilterGroupCheckbox
        title={I18n.t('store_search_category')}
        checkList={categoryIds.map(item => ({
          value: item.id ?? '',
          text: item.name ?? '',
        }))}
        onClick={categoryIn => {
          updateSearchFilter(ProductEntityType.Plugin, {
            category_ids: categoryIn as string[],
          });
        }}
        value={searchFilter[ProductEntityType.Plugin].category_ids}
      />
    </Space>
  );
};
