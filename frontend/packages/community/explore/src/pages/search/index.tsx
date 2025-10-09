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

import { useParams } from 'react-router-dom';
import React, { useEffect, useState, useCallback, useRef } from 'react';

import queryString from 'query-string';
import cls from 'classnames';
import { useScroll } from 'ahooks';
import { InfiniteList } from '@coze-community/components';
import { useMediaQuery, ScreenRange } from '@coze-arch/responsive-kit';
import { I18n } from '@coze-arch/i18n';
import { Select, SideSheet, Space, Typography } from '@coze-arch/coze-design';
import { UILayout } from '@coze-arch/bot-semi';
import { IconSvgListFilter } from '@coze-arch/bot-icons';
import {
  useLoggedIn,
  useIsResponsive,
  useSetResponsiveBodyStyle,
} from '@coze-arch/bot-hooks';
import {
  type SortType,
  type public_api,
  ProductEntityType,
  product_common,
} from '@coze-arch/bot-api/product_api';
import { ProductApi } from '@coze-arch/bot-api';

import { useEntityType } from '../../hooks/use-entity-type';
import {
  SearchCard,
  ResultWord,
  SearchFilterComponent,
  Header,
  renderEmpty,
} from '../../components/search';
import { type SearchFilter, type ValidEntityType } from './type';
import { useSearchStore } from './search-store';
import { gridResponsiveNumMap } from './config';

import styles from './index.module.less';
const { Text } = Typography;
type ProductInfo = public_api.ProductInfo;

// eslint-disable-next-line @coze-arch/max-line-per-function
export const SearchPage = () => {
  const [filterVisible, setFilterVisible] = useState<boolean>(false);
  // NOTE project 与 agent 混排，但是这里只能有一个 entityType 值，project 复用 agent 的值
  const { entityType } = useEntityType();
  const contentTopRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const params = useParams();
  const searchWord = params?.word ?? '';
  const isLogin = useLoggedIn();
  // isResponsive 为是否是手机的标识符
  const isResponsive = useIsResponsive();
  const [isShowDivider, setIsShowDivider] = useState(false);
  const isXl15Screen = useMediaQuery({ rangeMin: ScreenRange.XL1_5 });
  useSetResponsiveBodyStyle();

  const {
    sortType,
    updateSortType,
    searchFilter,
    resetSearchFilter,
    updateTotalCount,
    isClear,
  } = useSearchStore();

  const fetchSearch = useCallback(
    async (paramsIn: {
      keywordIn: string;
      filter: SearchFilter;
      sortTypeIn: SortType | 0;
      currentPageIn: number;
      entityTypeIn: ValidEntityType;
    }) => {
      const { keywordIn, filter, sortTypeIn, currentPageIn, entityTypeIn } =
        paramsIn;

      let entityTypes: ProductEntityType[] = [entityTypeIn];
      // agent 类型与 project 类型混排，有筛选项时使用筛选项，否则传两个
      if (entityTypeIn === ProductEntityType.Bot) {
        if (filter[entityTypeIn].entity_types?.length) {
          entityTypes = filter[entityTypeIn]
            .entity_types as ProductEntityType[];
        } else {
          entityTypes = [ProductEntityType.Bot, ProductEntityType.Project];
        }
      }

      const res = await ProductApi.PublicSearchProduct(
        {
          sort_type: sortTypeIn === 0 ? undefined : sortTypeIn,
          page_num: currentPageIn,
          page_size: 12,
          keyword: keywordIn,
          ...filter[entityTypeIn],
          entity_types: entityTypes,
        },
        {
          paramsSerializer: p =>
            queryString.stringify(p, { arrayFormat: 'comma' }),
        },
      );
      updateTotalCount(res?.data?.entity_total ?? {});
      const list = res?.data?.products ?? [];
      const hasMore = list?.length > 0 ? res?.data?.has_more : false;

      return {
        hasMore,
        list,
        nextPage: currentPageIn + 1,
      };
    },
    [],
  );

  useEffect(() => {
    if (filterVisible) {
      document.body.classList.add(styles.documentNoScroll);

      return () => {
        document.body.classList.remove(styles.documentNoScroll);
      };
    }
  }, [filterVisible]);

  const StortedContent = (
    <Select
      className={styles['sort-select']}
      value={sortType}
      optionList={[
        { value: 0, label: I18n.t('store_search_rank_default') },
        { value: product_common.SortType.Heat, label: I18n.t('Popular') },
        { value: product_common.SortType.Newest, label: I18n.t('Recent') },
      ]}
      onChange={val => updateSortType(Number(val))}
    />
  );
  const searchFilterNode = (
    <div
      className={cls(styles['right-content'], {
        [styles['is-mobile']]: isResponsive,
      })}
    >
      <div className={styles.top}>
        {I18n.t('store_search_filter')}
        <div
          className={cls(styles.reset, {
            [styles.default]: isClear,
          })}
          onClick={() => resetSearchFilter()}
        >
          {I18n.t('store_search_filter_clear')}
        </div>
      </div>
      <div className={styles.bottom}>
        <SearchFilterComponent
          entityType={entityType}
          isResponsive={isResponsive}
        />
      </div>
    </div>
  );

  useEffect(() => {
    scrollContainerRef.current?.scroll?.({ top: 0 });
  }, [sortType, searchFilter, searchWord, entityType]);

  useScroll(scrollContainerRef, val => {
    const { top } = val || {};
    let isShowTemp = false;
    if (top >= 8) {
      isShowTemp = true;
    }
    if (isShowTemp !== isShowDivider) {
      setIsShowDivider(isShowTemp);
    }
    return false;
  });

  return (
    <UILayout
      className={cls(styles['layout-container'], {
        [styles.responsive]: isResponsive,
        [styles['screen-xl1-5']]: isXl15Screen,
      })}
    >
      <Header
        isResponsive={isResponsive}
        isLogin={isLogin}
        searchWord={searchWord}
        entityType={entityType}
      />
      {/* <div className={styles['entity-selector-container']}>
        <EntityTypeSelector
          isResponsive={isResponsive}
          entityType={entityType}
          setEntityType={setEntityType}
        />
      </div> */}
      <UILayout.Content className={styles.content}>
        <div className={styles['left-content']}>
          <div
            className={cls(styles['top-container'], {
              [styles.divider]: isResponsive && isShowDivider,
            })}
          >
            <div
              className={cls(styles['nav-wraper'], {
                [styles.divider]: !isResponsive && isShowDivider,
              })}
              ref={contentTopRef}
            >
              <ResultWord isMobile={isResponsive} />
              {isResponsive ? (
                <Space spacing={8}>
                  <IconSvgListFilter
                    onClick={() => setFilterVisible(cur => !cur)}
                  />
                  {StortedContent}
                </Space>
              ) : (
                StortedContent
              )}
            </div>
          </div>
          <div className={styles.bottom} ref={scrollContainerRef}>
            {isResponsive ? (
              <SideSheet
                visible={filterVisible}
                placement={'top'}
                getPopupContainer={() =>
                  document.querySelector(`.${styles['layout-container']}`) ||
                  document.body
                }
                onCancel={() => setFilterVisible(false)}
                className={styles.sideSheet}
                closeOnEsc={false}
                closeIcon={null}
                closable={false}
                title={null}
                motion={false}
                disableScroll={true}
                height={'60%'}
                style={{
                  top: 0,
                  boxShadow:
                    '0px 0px 2px 0px rgba(0, 0, 0, 0.05), 0px 38px 90px 0px rgba(0, 0, 0, 0.25)',
                }}
                maskStyle={{
                  top: 0,
                  background: 'transparent',
                }}
              >
                {searchFilterNode}
              </SideSheet>
            ) : null}
            <InfiniteList<ProductInfo>
              isNeedBtnLoadMore={isResponsive}
              isResponsive={true}
              responsiveConf={{
                gridCols: gridResponsiveNumMap[entityType],
              }}
              canShowData={true}
              className={styles['scroll-container']}
              grid={{
                gutter: 20,
                span: 6,
              }}
              renderItem={(productInfo, _index) => (
                <SearchCard
                  key={productInfo.meta_info.id}
                  detail={productInfo}
                  entityType={entityType}
                />
              )}
              renderFooter={({ isLoading, isError, noMore }) => {
                if (!isError && !isLoading && noMore) {
                  return <Text className="coz-fg-dim">———·———</Text>;
                }
                return null;
              }}
              emptyConf={{
                renderEmpty: ({ isLoading, loadRetry, isError }) =>
                  renderEmpty({ isLoading, loadRetry, isError }, entityType),
              }}
              scrollConf={{
                reloadDeps: [sortType, searchFilter, searchWord, entityType],
                targetRef: scrollContainerRef,
                loadData: current =>
                  fetchSearch({
                    keywordIn: decodeURIComponent(searchWord),
                    filter: searchFilter,
                    sortTypeIn: sortType,
                    currentPageIn: current?.nextPage ?? 1,
                    entityTypeIn: entityType,
                  }),
              }}
            />
          </div>
        </div>
        {!isResponsive && searchFilterNode}
      </UILayout.Content>
    </UILayout>
  );
};
