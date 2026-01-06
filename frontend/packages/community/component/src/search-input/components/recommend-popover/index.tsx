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

import { useNavigate } from 'react-router-dom';
import React, { useEffect, useRef, useState } from 'react';

import cls from 'classnames';
import { useUpdateEffect } from 'ahooks';
import { I18n } from '@coze-arch/i18n';
import { sendTeaEvent, EVENT_NAMES } from '@coze-arch/bot-tea';
import { Typography } from '@coze-arch/bot-semi';
import { useLoggedIn } from '@coze-arch/bot-hooks';

import { RecommendMore } from '../recommend-more';
import { RecommendArea } from '../recommend-area';
import { useSearchInputStore } from '../../search-input-store';
import {
  defaultEntityAreaRefMap,
  type RecommendAreaRef,
  getAllowEntitySortList,
} from '../../config';

import styles from './index.module.less';

const { Text } = Typography;
interface RecommendPopoverProps {
  inputContainerRef: React.MutableRefObject<HTMLElement>;
  focus: boolean;
  inComposition: boolean;
  visible: boolean;
  setVisible: (visible: boolean) => void;
  onSearch?: (word: string) => void;
  focusInput?: (isFocus: boolean) => void;
  onResultEmpty?: (value: boolean) => void;
}

const checkDomInTargetPath = (target: HTMLElement, dom): boolean => {
  let currentTarget = target;
  while (currentTarget && currentTarget !== document.body) {
    if (currentTarget === dom) {
      return true;
    }
    // @ts-expect-error -- linter-disable-autofix
    currentTarget = currentTarget.parentElement;
  }
  return false;
};

interface AreaRef {
  [key: string]: RecommendAreaRef | null;
}

// eslint-disable-next-line @coze-arch/max-line-per-function
export const RecommendPopover = (props: RecommendPopoverProps) => {
  const {
    focus,
    inComposition,
    onSearch,
    visible,
    setVisible,
    focusInput,
    inputContainerRef,
    onResultEmpty,
  } = props;
  const containerRef = useRef<HTMLDivElement>();
  const [isEmpty, setIsEmpty] = useState(false);
  const navigate = useNavigate();
  const areaRef = useRef<AreaRef>({
    ...defaultEntityAreaRefMap,
  });

  const {
    inputValue,
    ableKeyBoardJumpDetail,
    setAbleKeyBoardJumpDetail,
    resetAllContentLength,
    changeCurrentSelectIndexByDirection,
    resetCurrentSelectIndex,
    entityTypeIn,
    currentEntitySort,
    setCurrentEntitySort,
  } = useSearchInputStore();

  const ableKeyPressJump = !inComposition && focus;
  const isLogin = useLoggedIn();

  useEffect(() => {
    const tempAreaSort = getAllowEntitySortList({ isLogin });

    //过滤掉当前页面的类型，并将其加到最前边
    const leftEntity = tempAreaSort.filter(item => item !== entityTypeIn);

    if (leftEntity.length !== tempAreaSort.length) {
      setCurrentEntitySort([entityTypeIn, ...leftEntity]);
    } else {
      setCurrentEntitySort([...tempAreaSort]);
    }
    resetCurrentSelectIndex();
  }, [entityTypeIn, isLogin]);
  useEffect(() => {
    areaRef.current = {
      ...defaultEntityAreaRefMap,
    };
    // 重置键盘可跳转详情页的标识位
    setAbleKeyBoardJumpDetail(false);
    // 重置所有模块的长度
    resetAllContentLength();
    // 重置selectedIndex位置
    resetCurrentSelectIndex();
    containerRef.current?.scrollTo?.(0, 0);
    if (inputValue.length > 0 && focus) {
      setVisible(true);
    }
  }, [inputValue]);

  useEffect(() => {
    if (focus) {
      setVisible(true);
      setAbleKeyBoardJumpDetail(false);
      resetCurrentSelectIndex();
    }
  }, [focus]);

  useEffect(() => {
    if (visible) {
      const close = (e: KeyboardEvent) => {
        if (e.code === 'Escape') {
          setVisible(false);
        }
      };
      const closeClick = (e: MouseEvent) => {
        if (
          checkDomInTargetPath(
            e.target as HTMLElement,
            inputContainerRef.current,
          )
        ) {
          // 不关闭
        } else {
          setVisible(false);
        }
      };
      document.addEventListener('keydown', close, true);
      document.addEventListener('click', closeClick);
      return () => {
        document.removeEventListener('keydown', close, true);
        document.removeEventListener('click', closeClick);
        resetCurrentSelectIndex();
      };
    }
  }, [visible]);

  // 上下键盘切换焦点
  useEffect(() => {
    if (visible) {
      sendTeaEvent(EVENT_NAMES.store_search_front, {
        search_word: inputValue,
        action: 'click',
      });
      const listenKeydown = (e: KeyboardEvent) => {
        if (e.code === 'ArrowUp') {
          const res = changeCurrentSelectIndexByDirection(0);
          e.preventDefault();
          if (res?.isTop) {
            focusInput?.(true);
            containerRef.current?.scrollTo?.({
              top: 0,
              behavior: 'smooth',
            });
          }
        }
        if (e.code === 'ArrowDown') {
          changeCurrentSelectIndexByDirection(1);
          setAbleKeyBoardJumpDetail(true);
          e.preventDefault();
          focusInput?.(false);
        }
      };
      document.addEventListener('keydown', listenKeydown);
      return () => {
        document.removeEventListener('keydown', listenKeydown);
      };
    }
  }, [visible]);

  // enter事件响应
  useEffect(() => {
    if (inputValue.length > 0 && ableKeyPressJump && !ableKeyBoardJumpDetail) {
      const enterListener = (e: KeyboardEvent) => {
        if (e.code === 'Enter' || e.key === 'Enter' || e.keyCode === 13) {
          sendTeaEvent(EVENT_NAMES.store_search_front, {
            search_word: inputValue,
            action: 'enter_search',
          });
          if (onSearch) {
            onSearch(
              `/search/${encodeURIComponent(
                inputValue,
              )}?entityType=${entityTypeIn}`,
            );
            setVisible(false);
          } else {
            // 跳转搜索结果页
            navigate(
              `/search/${encodeURIComponent(
                inputValue,
              )}?entityType=${entityTypeIn}`,
            );
          }
        }
      };

      document.addEventListener('keydown', enterListener);

      return () => {
        document.removeEventListener('keydown', enterListener);
      };
    }
  }, [inputValue, ableKeyPressJump, ableKeyBoardJumpDetail]);
  const onResultChange = () => {
    let isEmptyTemp = true;
    Object.keys(areaRef.current).map(key => {
      const item = areaRef.current[key];
      //如果数据还在加载中，或者有数据存在，就是数据不空
      if (!currentEntitySort.includes(Number(key))) {
        return;
      }
      if (
        !item ||
        item.isLoading() === true ||
        item.getResultList().length > 0
      ) {
        isEmptyTemp = false;
      }
    });
    setIsEmpty(isEmptyTemp);

    onResultEmpty?.(isEmptyTemp);
  };
  useUpdateEffect(() => {
    if (!visible) {
      setAbleKeyBoardJumpDetail(false);
    }
    const onWheel = event => {
      if (!containerRef.current) {
        return;
      }
      if (
        containerRef.current?.scrollTop + containerRef.current?.offsetHeight >=
          containerRef.current?.scrollHeight &&
        event.deltaY > 0
      ) {
        event?.preventDefault();
      } else if (containerRef.current?.scrollTop === 0 && event?.deltaY < 0) {
        event?.preventDefault();
      }
    };
    containerRef.current?.addEventListener('wheel', onWheel);
    return () => {
      containerRef.current?.removeEventListener('wheel', onWheel);
    };
  }, [visible]);

  return (
    <div
      className={cls(styles.popoverContainer, {
        [styles.visible]: visible,
      })}
    >
      <div
        className={styles.contentCotaniner}
        onClickCapture={e => e.stopPropagation()}
      >
        <div className={styles.divider} />

        <div
          className={styles['area-container']}
          ref={elem => {
            // @ts-expect-error -- linter-disable-autofix
            containerRef.current = elem;
          }}
        >
          {inputValue.length === 0 ? (
            <Text className={styles.title}>
              {I18n.t('store_search_recently_viewed')}
            </Text>
          ) : null}
          {isEmpty ? (
            <Text className={styles.nofound}>
              {I18n.t('store_search_suggest_no_result')}
            </Text>
          ) : null}
          {currentEntitySort.map(item => (
            <RecommendArea
              {...props}
              key={item}
              entityType={item}
              onResultChange={onResultChange}
              ref={ref => (areaRef.current[item] = ref)}
              // @ts-expect-error -- linter-disable-autofix
              containerRef={containerRef}
            />
          ))}
        </div>

        {inputValue.length > 0 && (
          <>
            <div
              className={styles.divider}
              style={{
                margin: 0,
              }}
            />
            <RecommendMore
              onSearch={
                onSearch
                  ? (word: string) => {
                      onSearch?.(word);
                      setVisible(false);
                    }
                  : undefined
              }
            />
          </>
        )}
      </div>
    </div>
  );
};
