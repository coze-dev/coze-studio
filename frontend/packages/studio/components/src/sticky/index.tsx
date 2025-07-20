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
 
import { useEffect, type PropsWithChildren, useRef, useState } from 'react';

import cls from 'classnames';
import { useScroll } from 'ahooks';

interface StickyProps {
  /** 滚动容器，也就是那个 scrollHeight 大于 viewportHeight，overflow-y auto/scroll 的容器 */
  scrollContainerRef: () => Element;
  /**
   * 作用同 css sticky 时的 top 属性
   * @default 0
   */
  top?: number;
  /**
   * 触发 sticky 后，底部（为了美观）额外的滚动距离
   * @default 0
   */
  bottom?: number;
}

/**
 * sticky 容器组件，用于解决 sticky 元素高于视窗时无法全部露出的问题
 *
 * 效果是触发 sticky 后，sticky 容器会跟随滚动容器的滚动而有限地上下移动
 */
export function Sticky({
  top: stickyTop = 0,
  bottom: stickyBottom = 0,
  scrollContainerRef,
  children,
}: PropsWithChildren<StickyProps>) {
  const stickyContainerRef = useRef<HTMLDivElement>(null);
  /** 一个不可见的元素，用于通过 IntersectionObserver 检测是否已经 sticky */
  const stickyDetectRef = useRef<HTMLDivElement>(null);
  const [isSticky, setIsSticky] = useState(false);
  const prevScrollTop = useRef(scrollContainerRef()?.scrollTop || 0);
  // sticky 容器模拟向上滚动的距离
  const [simulateScrollDistance, setSimulateScrollDistance] = useState(0);

  useEffect(() => {
    if (!stickyDetectRef.current) {
      return;
    }

    /** IntersectionObserver 监听是否触发 sticky */
    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        const { isIntersecting } = entry;
        setIsSticky(!isIntersecting);
      },
      { rootMargin: `-${stickyTop}px 0px 0px` },
    );
    intersectionObserver.observe(stickyDetectRef.current);

    return () => {
      intersectionObserver.disconnect();
    };
  }, []);

  // 已测试该方法能监听 `scrollTo` 等方法产生的 scroll，无论模式是 smooth 还是 instant
  useScroll(scrollContainerRef, scrollEvent => {
    /** 页面整体向上（scrollbar 向下移动）滚动的距离，为负则代表页面向下滚动 */
    const scrollUpDistance = scrollEvent.top - prevScrollTop.current;
    prevScrollTop.current = scrollEvent.top;

    if (!stickyContainerRef.current || !isSticky) {
      // return false 避免 useScroll 产生 rerender，下同
      // （回调内的其他 setState 会正常触发 rerender）
      return false;
    }

    const viewportHeight = window.innerHeight;
    const stickyContainerHeight = stickyContainerRef.current?.scrollHeight || 0;

    /** 触发 sticky 后，模拟滚动的容器高度 */
    const simulateStickyContainerHeight =
      stickyContainerHeight + stickyTop + stickyBottom;
    // 判断高度是否小于 viewport，是的话始终能正常显示在视图内，不用后面乱七八糟一堆计算了
    if (simulateStickyContainerHeight < viewportHeight) {
      return false;
    }
    /** 模拟滚动容器比视窗高出的部分，也即模拟滚动的上限 */
    const simulateMaxScrollDistance =
      simulateStickyContainerHeight - viewportHeight;

    if (scrollUpDistance > 0) {
      // #region 处理向上滚动
      const stickyReachedBottom =
        simulateScrollDistance >= simulateMaxScrollDistance;
      if (stickyReachedBottom) {
        setSimulateScrollDistance(simulateMaxScrollDistance);
        return false;
      }
      setSimulateScrollDistance(
        Math.min(
          simulateScrollDistance + scrollUpDistance,
          simulateMaxScrollDistance,
        ),
      );
      return false;
      // #endregion
    } else {
      // #region 处理向下滚动
      const stickyReachedTop = simulateScrollDistance <= 0;
      if (stickyReachedTop) {
        setSimulateScrollDistance(0);
        return false;
      }
      setSimulateScrollDistance(
        Math.max(simulateScrollDistance + scrollUpDistance, 0),
      );
      return false;
      // #endregion
    }
  });

  return (
    <div
      ref={stickyContainerRef}
      className={cls('sticky')}
      style={{ top: stickyTop - simulateScrollDistance }}
    >
      <div ref={stickyDetectRef} className="absolute top-[-1px]" />
      {children}
    </div>
  );
}
