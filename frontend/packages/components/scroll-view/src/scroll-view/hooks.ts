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
 
/* eslint-disable @typescript-eslint/naming-convention */
import { type RefObject, useEffect, useLayoutEffect, useRef } from 'react';

import { isNumber } from 'lodash-es';

import { isAppleWebkit } from '../utils/is-apple-webkit';
import { supportNegativeScrollTop } from './utils';
import { ScrollStatus, type ScrollViewController } from './type';
import { SCROLL_VIEW_ANCHOR_CONTAINER } from './consts';

const SUPPORT_NEGATIVE_SCROLL_TOP = supportNegativeScrollTop();

import styles from './index.module.less';

export interface UseScrollViewControllerAndStateParams {
  /** 滚动方向 */
  reverse: boolean;
  /** 滚动状态，自动吸顶/吸底时依赖，当Top时自动吸顶，当Bottom时自动吸底 */
  scrollStatusRef?: RefObject<ScrollStatus>;
}

export interface UseScrollViewControllerAndStateReturnValue {
  /** 注入到滚动容器的引用 */
  ref: RefObject<HTMLDivElement>;
  /** 滚动容器外层 dom 的引用 */
  wrapperRef: RefObject<HTMLDivElement>;
  /** 控制器 */
  controller: ScrollViewController;
}

// eslint-disable-next-line max-lines-per-function, @coze-arch/max-line-per-function
export const useScrollViewControllerAndState = ({
  reverse,
  scrollStatusRef,
}: UseScrollViewControllerAndStateParams): UseScrollViewControllerAndStateReturnValue => {
  const wrapperRef = useRef<HTMLDivElement>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  const isDisableScroll = useRef<boolean>(false);

  const getScrollViewWrapper = () => wrapperRef;

  const getContainer = () => {
    const { current: container } = containerRef;

    if (!container) {
      throw Error('Not found ScrollView ref instance');
    }

    return container;
  };

  const _getContainerScrollTop = () => {
    const container = getContainer();

    if (reverse && !SUPPORT_NEGATIVE_SCROLL_TOP) {
      return (
        container.scrollTop - (container.scrollHeight - container.offsetHeight)
      );
    }

    return container.scrollTop;
  };

  const _setContainerScrollTop = (value: number) => {
    const container = getContainer();

    if (reverse && !SUPPORT_NEGATIVE_SCROLL_TOP) {
      container.scrollTop =
        value + (container.scrollHeight - container.offsetHeight);

      return;
    }

    container.scrollTop = value;
  };

  const disableScroll = () => {
    isDisableScroll.current = true;
    containerRef.current?.classList.add(styles['disable-scroll']);
    scrollTo(top => top - 1);
  };
  const enableScroll = () => {
    isDisableScroll.current = false;
    containerRef.current?.classList.remove(styles['disable-scroll']);
  };

  const scrollTo = (update: (prev: number) => number) => {
    const { current: container } = containerRef;

    if (!container) {
      return;
    }

    const updatingScrollTop = update(_getContainerScrollTop());

    if (isAppleWebkit()) {
      if (reverse) {
        const endingScrollTop =
          container.offsetHeight - container.scrollHeight + 1;

        _setContainerScrollTop(Math.max(updatingScrollTop, endingScrollTop));
      } else {
        const endingScrollTop =
          container.scrollHeight - container.offsetHeight - 1;

        _setContainerScrollTop(Math.min(updatingScrollTop, endingScrollTop));
      }
    } else {
      _setContainerScrollTop(updatingScrollTop);
    }
  };

  const scrollToPercentage = async (ratio: number) => {
    if (isDisableScroll.current) {
      return;
    }

    const { current: container } = containerRef;

    if (!container) {
      return;
    }

    const { offsetHeight, scrollHeight } = container;

    /** 当当前不是滚动状态时，不调整滚动进度 */
    if (scrollHeight <= offsetHeight) {
      return;
    }

    const endScrollTop = reverse
      ? offsetHeight - scrollHeight
      : scrollHeight - offsetHeight;
    const realRatio = reverse ? 1 - ratio : ratio;

    _setContainerScrollTop(endScrollTop * realRatio);

    return new Promise<void>(resolve => {
      requestAnimationFrame(() => {
        resolve();
      });
    });
  };

  const getScrollPercentage = () => {
    const { current: container } = containerRef;

    if (!container) {
      return 0;
    }

    const { scrollHeight, offsetHeight } = container;

    const scrollTop = _getContainerScrollTop();

    const relativeRatio = Math.abs(scrollTop) / (scrollHeight - offsetHeight);
    return reverse ? 1 - relativeRatio : relativeRatio;
  };

  const getScrollTop = () => {
    const { current: container } = containerRef;

    if (!container) {
      return 0;
    }

    const { scrollHeight, offsetHeight } = container;

    const scrollTop = _getContainerScrollTop();

    return reverse ? scrollHeight - (offsetHeight + -scrollTop) : scrollTop;
  };

  const getScrollBottom = () => {
    const { current: container } = containerRef;

    if (!container) {
      return 0;
    }

    return container.scrollHeight - getScrollTop() - container.offsetHeight;
  };

  const refreshAnchor = () => {
    if (scrollStatusRef?.current === ScrollStatus.Top) {
      scrollToPercentage(0);
    } else if (scrollStatusRef?.current === ScrollStatus.Bottom) {
      scrollToPercentage(1);
    }
  };

  const checkContentIsFull = () => {
    const container = containerRef.current;
    if (!container) {
      console.warn('[checkContentIsFull] container not found');
      return false;
    }
    const rect = container.getBoundingClientRect();
    const parentNode = container.parentElement;
    const parentRect = parentNode?.getBoundingClientRect();
    return (parentRect?.height ?? 0) === rect.height;
  };

  const getOriginScrollInfo = () => {
    const { current: container } = containerRef;
    if (!container) {
      return { scrollHeight: 0, scrollTop: 0, rect: null };
    }
    return {
      scrollHeight: container.scrollHeight,
      scrollTop: container.scrollTop,
      rect: container.getBoundingClientRect(),
    };
  };

  useEffect(() => {
    containerRef.current?.addEventListener('touchstart', () => {
      isDisableScroll.current = true;
    });

    containerRef.current?.addEventListener('touchend', () => {
      isDisableScroll.current = false;
    });
  }, []);

  return {
    wrapperRef,
    ref: containerRef,
    controller: {
      getScrollViewWrapper,
      scrollTo,
      scrollToPercentage,
      getScrollPercentage,
      getScrollTop,
      getOriginScrollInfo,
      getScrollBottom,
      refreshAnchor,
      disableScroll,
      enableScroll,
      checkContentIsFull,
    },
  };
};

export interface UseAutoAnchorWhenPrependOnSafariParams {
  /** 滚动方法 */
  scrollTo: ScrollViewController['scrollTo'];
  /** 获取当前滚动距底部距离 */
  getScrollBottom: ScrollViewController['getScrollTop'];
  /** 滚动方向 */
  reverse: boolean;
  /** 启用锚定时离边界的最小值，默认为10 */
  enableThreshold?: number;
}

/**
 * 处理y-reverse在Safari下，向下插入元素时自动锚定的问题（safari不支持overflow-anchor属性）
 */
export const useAutoAnchorWhenAppendOnSafari = ({
  scrollTo,
  getScrollBottom,
  reverse,
  enableThreshold = 10,
}: UseAutoAnchorWhenPrependOnSafariParams) => {
  useLayoutEffect(() => {
    if (!isAppleWebkit() || !reverse) {
      return;
    }

    let prevLastChild: undefined | string;

    let prevContainerHeight: undefined | number;

    const scrollToKeepAnchor = () => {
      const container = document.querySelector(
        `.${SCROLL_VIEW_ANCHOR_CONTAINER}`,
      );

      if (container) {
        const currentLastChild = container.lastElementChild?.outerHTML;

        const currentContainerHeight = container.getBoundingClientRect().height;

        if (prevLastChild && isNumber(prevContainerHeight)) {
          /** 末尾元素变了，同时高度变了，那就断定为末尾元素插入，但是仅当超过阈值时才锚定 */
          if (
            prevContainerHeight !== currentContainerHeight &&
            currentLastChild !== prevLastChild &&
            Math.abs(getScrollBottom()) > enableThreshold
          ) {
            const heightIncrease = currentContainerHeight - prevContainerHeight;

            scrollTo(prevScrollTop => prevScrollTop - heightIncrease);
          }
        }

        prevContainerHeight = currentContainerHeight;

        prevLastChild = currentLastChild ?? undefined;
      }

      requestAnimationFrame(scrollToKeepAnchor);
    };

    requestAnimationFrame(scrollToKeepAnchor);
  }, []);
};
