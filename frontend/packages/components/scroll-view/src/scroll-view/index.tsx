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

/* eslint-disable @coze-arch/max-line-per-function */

import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
} from 'react';

import { debounce, isFunction } from 'lodash-es';
import cs from 'classnames';

import {
  type ScrollViewProps,
  type ScrollViewController,
  ScrollStatus,
} from './type';
import {
  useAutoAnchorWhenAppendOnSafari,
  useScrollViewControllerAndState,
} from './hooks';
import { ScrollViewContentContext } from './context';

import styles from './index.module.less';

export { useScrollViewContentRef } from './context';

const DEBOUNCE_TIME = 100;

export const ScrollView = forwardRef<ScrollViewController, ScrollViewProps>(
  function ScrollView(
    {
      style,
      className,
      children,
      before,
      beforeClassName,
      after,
      innerBefore,
      reverse = false,
      reachTopThreshold,
      onReachTop,
      onLeaveTop,
      reachBottomThreshold,
      onReachBottom,
      onLeaveBottom,
      showScrollbar,
      autoShowScrollbar,
      onScroll,
      scrollbarWidthNone = true,
    },
    outerRef,
  ) {
    /** At the very beginning, the default scrolling state */
    const defaultScrollStatus = reverse
      ? ScrollStatus.Bottom
      : ScrollStatus.Top;

    const scrollViewContentRef = useRef<HTMLDivElement | null>(null);
    const scrollStatusRef = useRef(defaultScrollStatus);

    const { wrapperRef, ref, controller } = useScrollViewControllerAndState({
      reverse,
      scrollStatusRef,
    });

    const { getScrollTop, getScrollBottom, scrollTo } = controller;

    const isReachTopRef = useRef<boolean>(false);

    const isReachBottomRef = useRef<boolean>(false);

    useImperativeHandle(outerRef, () => controller, [controller]);

    const handleDebounceUpdateScrollStatus = useMemo(
      () =>
        debounce((scrollStatus: ScrollStatus) => {
          scrollStatusRef.current = scrollStatus;
        }, DEBOUNCE_TIME),
      [],
    );

    const handleScroll = useCallback(
      ((e: React.UIEvent<HTMLElement>) => {
        if (!e.currentTarget) {
          return;
        }

        onScroll?.(e);

        const { offsetHeight } = e.currentTarget;

        const topThreshold = reachTopThreshold ?? offsetHeight;

        const bottomThreshold = reachBottomThreshold ?? offsetHeight;

        const anchorThreshold = 0;

        /** Scroll to the upper boundary of the event */
        if (getScrollTop() < topThreshold) {
          if (!isReachTopRef.current) {
            isReachTopRef.current = true;
            onReachTop?.();
          }
        } else {
          if (isReachTopRef.current) {
            isReachTopRef.current = false;
            onLeaveTop?.();
          }
        }

        /** Scroll to the lower boundary of the event */
        if (getScrollBottom() < bottomThreshold) {
          if (!isReachBottomRef.current) {
            isReachBottomRef.current = true;
            onReachBottom?.();
          }
        } else {
          if (isReachBottomRef.current) {
            isReachBottomRef.current = false;
            onLeaveBottom?.();
          }
        }

        /** Scroll to the automatic welt (anchor) boundary, release first and then delay updating the welt state to prevent automatic welt and scroll conflicts when the welt threshold has not been rolled out */
        scrollStatusRef.current = ScrollStatus.Inner;
        if (
          getScrollTop() <= anchorThreshold &&
          getScrollBottom() <= anchorThreshold
        ) {
          handleDebounceUpdateScrollStatus(defaultScrollStatus);
        } else if (getScrollTop() <= anchorThreshold) {
          handleDebounceUpdateScrollStatus(ScrollStatus.Top);
        } else if (getScrollBottom() <= anchorThreshold) {
          handleDebounceUpdateScrollStatus(ScrollStatus.Bottom);
        } else {
          handleDebounceUpdateScrollStatus(ScrollStatus.Inner);
        }
      }) satisfies ScrollViewProps['onScroll'],
      [
        reachTopThreshold,
        reachBottomThreshold,
        getScrollTop,
        getScrollBottom,
        onReachTop,
        onLeaveTop,
        onReachBottom,
        onLeaveBottom,
      ],
    );

    useAutoAnchorWhenAppendOnSafari({ scrollTo, reverse, getScrollBottom });

    return (
      <ScrollViewContentContext.Provider value={scrollViewContentRef}>
        <div
          className={cs(styles['scroll-view'], className)}
          style={style}
          ref={wrapperRef}
        >
          {before ? (
            <div className={cs(styles.before, beforeClassName)}>
              {isFunction(before) ? before?.(controller) : before}
            </div>
          ) : null}

          <div
            className={cs(styles.content)}
            ref={scrollViewContentRef}
            data-testid="chat-area.message-content"
          >
            <div
              ref={ref}
              data-scroll-element="scrollable"
              className={cs(
                styles.scrollable,
                showScrollbar && styles['show-scrollbar'],
                autoShowScrollbar && styles['auto-show-scrollbar'],
                scrollbarWidthNone && styles['scrollbar-width-none'],
                {
                  [styles.reverse]: reverse,
                },
              )}
              onScroll={handleScroll}
            >
              {isFunction(children) ? children(controller) : children}
              {innerBefore ? (
                <div className={cs(styles.before)}>
                  {isFunction(innerBefore)
                    ? innerBefore?.(controller)
                    : innerBefore}
                </div>
              ) : null}
            </div>
          </div>

          {after ? (
            <div className={cs(styles.after)}>
              {isFunction(after) ? after?.(controller) : after}
            </div>
          ) : null}
        </div>
      </ScrollViewContentContext.Provider>
    );
  },
);
