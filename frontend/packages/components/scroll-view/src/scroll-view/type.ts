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
 
import { type RefObject } from 'react';

export interface ScrollViewController {
  /** 滚动到  */
  scrollTo: (update: (prev: number) => number) => void;
  /** 滚动到可滚动高度的指定百分比的位置，以容器顶部为参考基线；当滚动完毕后回调callback */
  scrollToPercentage: (ratio: number) => Promise<void> | void;
  /** 获取当前滚动百分比 */
  getScrollPercentage: () => number;
  /** 获取当前滚动状态距离顶部的距离，适配y方向和y-reverse方向的情况 */
  getScrollTop: () => number;
  /** 获取原始的 scroll top 值，不做换算 */
  getOriginScrollInfo: () => {
    scrollHeight: number;
    scrollTop: number;
    rect: null | DOMRect;
  };
  /** 获取当前滚动状态距离顶部的距离，适配y方向和y-reverse方向的情况 */
  getScrollBottom: () => number;
  /** 更新吸顶/吸底状态，当数据有更新时主动调用此API */
  refreshAnchor: () => void;
  /** 禁止容器滚动 */
  disableScroll: () => void;
  /** 使得容器可滚动 */
  enableScroll: () => void;
  /** 检查内容充满容器（用于初始状态高度较小的情况，防止无法触发 scroll 事件） */
  checkContentIsFull: () => boolean;
  /** 获取 scroll 外层容器的引用 */
  getScrollViewWrapper: () => RefObject<HTMLDivElement>;
}

export interface ScrollViewProps
  extends Pick<
    React.HTMLAttributes<unknown>,
    'className' | 'style' | 'onScroll'
  > {
  children:
    | ((controller: ScrollViewController) => JSX.Element)
    | React.ReactNode;

  before?:
    | ((controller: ScrollViewController) => JSX.Element)
    | JSX.Element
    | null;
  beforeClassName?: string;
  after?: ((controller: ScrollViewController) => JSX.Element) | JSX.Element;
  innerBefore?:
    | ((controller: ScrollViewController) => JSX.Element)
    | JSX.Element;
  /** 是否反转，从下往上滚动 */
  reverse?: boolean;
  /** 剩余滚动至顶部距离小于多少时触发，默认为offsetHeight */
  reachTopThreshold?: number;
  /* 滚动到达顶部阈值 */
  onReachTop?: () => unknown;
  /* 滚动离开顶部阈值 */
  onLeaveTop?: () => unknown;

  /** 剩余滚动至底部距离小于多少时触发，默认为offsetHeight */
  reachBottomThreshold?: number;
  /** 滚动到达底部阈值 */
  onReachBottom?: () => unknown;
  /** 滚动离开底部阈值 */
  onLeaveBottom?: () => unknown;
  /** 不管内容是否超出 container 都展示 scrollBar */
  showScrollbar?: boolean;
  /** 内容超出 container 时才展示 scrollBar，若未超出，不展示 scrollBar */
  autoShowScrollbar?: boolean;
  /** 完全隐藏 scrollbar */
  scrollbarWidthNone?: boolean;
}

/** 滚动状态 */
export enum ScrollStatus {
  /** 吸顶 */
  Top = 'top',
  /** 吸底 */
  Bottom = 'bottom',
  /** 中间可双向滚动 */
  Inner = 'inner',
}
