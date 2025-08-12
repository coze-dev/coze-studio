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
  /** Scroll to  */
  scrollTo: (update: (prev: number) => number) => void;
  /** Scroll to a specified percentage of the scrollable height, using the top of the container as a reference baseline; callback when scrolling is complete */
  scrollToPercentage: (ratio: number) => Promise<void> | void;
  /** Get the current scroll percentage */
  getScrollPercentage: () => number;
  /** Get the distance from the top of the current scrolling state, adapt the y-direction and y-reverse direction */
  getScrollTop: () => number;
  /** Get the original scroll top value without conversion */
  getOriginScrollInfo: () => {
    scrollHeight: number;
    scrollTop: number;
    rect: null | DOMRect;
  };
  /** Get the distance from the top of the current scrolling state, adapt the y-direction and y-reverse direction */
  getScrollBottom: () => number;
  /** Update the ceiling/bottom suction status, and actively call this API when the data is updated */
  refreshAnchor: () => void;
  /** Disable container scrolling */
  disableScroll: () => void;
  /** Makes the container scrollable */
  enableScroll: () => void;
  /** Check that the content fills the container (used when the initial state height is small to prevent the scroll event from being triggered) */
  checkContentIsFull: () => boolean;
  /** Get a reference to the scroll outer container */
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
  /** Whether to reverse, scroll from bottom to top */
  reverse?: boolean;
  /** Triggered when the remaining scroll to the top is less than the distance, the default is offsetHeight */
  reachTopThreshold?: number;
  /* Scroll to the top threshold */
  onReachTop?: () => unknown;
  /* Scroll away from the top threshold */
  onLeaveTop?: () => unknown;

  /** Triggered when the remaining scroll to the bottom distance is less than, the default is offsetHeight */
  reachBottomThreshold?: number;
  /** Scroll to the bottom threshold */
  onReachBottom?: () => unknown;
  /** Scroll away from the bottom threshold */
  onLeaveBottom?: () => unknown;
  /** Show scrollBar regardless of whether the content exceeds the container. */
  showScrollbar?: boolean;
  /** The scrollBar is only displayed when the content exceeds the container. If it does not exceed, the scrollBar is not displayed. */
  autoShowScrollbar?: boolean;
  /** Completely hide scrollbar */
  scrollbarWidthNone?: boolean;
}

/** scrolling state */
export enum ScrollStatus {
  /** Ceiling */
  Top = 'top',
  /** bottom suction */
  Bottom = 'bottom',
  /** Two-way scrolling in the middle */
  Inner = 'inner',
}
