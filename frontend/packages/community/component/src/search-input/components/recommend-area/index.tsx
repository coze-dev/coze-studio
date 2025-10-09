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

import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useImperativeHandle,
  type MutableRefObject,
} from 'react';

import queryString from 'query-string';
import { debounce } from 'lodash-es';
import axios, { type CancelTokenSource } from 'axios';
import { sendTeaEvent, EVENT_NAMES } from '@coze-arch/bot-tea';
import { IconLoading } from '@coze-arch/bot-icons';
import {
  ProductEntityType,
  type ProductInfo,
} from '@coze-arch/bot-api/product_api';
import { ProductApi } from '@coze-arch/bot-api';

import {
  RecommendItem,
  RecommendSkeleton,
  RecommendItemMore,
} from '../recommend-item';
import { useSearchInputStore } from '../../search-input-store';
import { type RecommendAreaRef, entityNameMap } from '../../config';

import styles from './index.module.less';

interface RecommendPopoverProps {
  focus: boolean;
  inComposition: boolean;
  onSearch?: (word: string) => void;
  entityType: ProductEntityType;
  onResultChange?: () => void;
  containerRef?: MutableRefObject<HTMLElement>;
}

export const RecommendArea = React.forwardRef(
  // eslint-disable-next-line @coze-arch/max-line-per-function -- ignore
  (props: RecommendPopoverProps, ref: React.ForwardedRef<RecommendAreaRef>) => {
    const { inComposition, entityType, onResultChange, containerRef } = props;

    const [contentList, setContentList] = useState<ProductInfo[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [hasMore, setHasMore] = useState<boolean>(false);

    const {
      inputValue,
      ableKeyBoardJumpDetail,
      setContentLength,
      currentSelectedIndex,
      setCurrentSelectIndex,
    } = useSearchInputStore();

    // const isLogin = useLoggedIn();

    const cancelSource = useRef<CancelTokenSource>();
    const currentPageRef = useRef<number>(1);

    const ableKeyPressJump = !inComposition;

    const requestList = useCallback(
      debounce(
        async (valueIn?: string) => {
          sendTeaEvent(EVENT_NAMES.store_search_front, {
            search_word: valueIn || '',
            action: 'type',
          });
          cancelSource.current = axios.CancelToken.source();
          try {
            setIsLoading(true);
            const { data } = await ProductApi.PublicSearchSuggest(
              {
                keyword: valueIn,
                ...(entityType === ProductEntityType.Bot
                  ? {
                      entity_types: [
                        ProductEntityType.Bot,
                        ProductEntityType.Project,
                      ],
                    }
                  : {
                      entity_type: entityType,
                    }),
                page_num: currentPageRef.current++,
                page_size: 5,
              },
              {
                cancelToken: cancelSource.current.token,
                paramsSerializer: p =>
                  queryString.stringify(p, { arrayFormat: 'comma' }),
              },
            );
            const list = data?.suggestion_v2 ?? [];
            const hasMoreTemp = list?.length > 0 ? data?.has_more : false;
            setHasMore(hasMoreTemp || false);
            setIsLoading(false);

            setContentList(cur => {
              const newList = [...cur, ...list];
              const itemLength =
                (newList?.length ?? 0) + (data?.has_more ? 1 : 0);
              setContentLength(entityType, itemLength);
              return newList;
            });
            // eslint-disable-next-line @coze-arch/use-error-in-catch
          } catch (e) {
            console.log('[dev] 正常请求打断');
          }
        },
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        300,
        {
          leading: false,
        },
      ),
      [entityType],
    );

    useEffect(() => {
      // 打断正在进行中的请求
      cancelSource.current?.cancel?.('suggest request cancle by user');
      // 正在加载状态设置成true
      setIsLoading(true);
      // 清空列表
      setContentList([]);
      // 重置页数
      currentPageRef.current = 1;
      // 请求
      requestList(inputValue);
    }, [inputValue]);

    useImperativeHandle(
      ref,
      () => ({
        getResultList: () => contentList,
        isLoading: () => isLoading,
      }),
      [isLoading, contentList],
    );
    useEffect(() => {
      onResultChange?.();
    }, [contentList, isLoading]);
    if (contentList.length === 0 && !isLoading) {
      return null;
    }

    return (
      <div className={styles.popoverContainer}>
        <div className={styles.title}>{entityNameMap[entityType]?.()}</div>
        {isLoading && contentList.length === 0 ? (
          new Array(4)
            .fill('')
            .map((_, index) => <RecommendSkeleton key={index} />)
        ) : (
          <>
            {contentList.map((item, index) => (
              <RecommendItem
                item={item}
                key={index}
                ableKeyPressJump={ableKeyPressJump && ableKeyBoardJumpDetail}
                isSelected={
                  currentSelectedIndex.index === index &&
                  currentSelectedIndex.type === entityType
                }
                onMouseHover={() => setCurrentSelectIndex(entityType, index)}
                entityType={entityType}
                containerRef={containerRef}
              />
            ))}
            {hasMore ? (
              <div className={styles.loadMoreContainer}>
                {isLoading ? (
                  <div className={styles.loading}>
                    <IconLoading className={styles.loadingIcon} />
                  </div>
                ) : (
                  <RecommendItemMore
                    isSelected={
                      currentSelectedIndex.index === contentList.length &&
                      currentSelectedIndex.type === entityType
                    }
                    onMouseHover={() =>
                      setCurrentSelectIndex(entityType, contentList.length)
                    }
                    containerRef={containerRef}
                    ableKeyPressJump={ableKeyPressJump}
                    requestList={() => {
                      requestList(inputValue);
                    }}
                  />
                )}
              </div>
            ) : null}
          </>
        )}
      </div>
    );
  },
);
