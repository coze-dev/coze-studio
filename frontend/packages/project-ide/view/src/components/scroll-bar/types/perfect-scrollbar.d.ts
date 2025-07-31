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

declare namespace PerfectScrollbar {
  export interface Options {
    handlers?: string[];
    maxScrollbarLength?: number;
    minScrollbarLength?: number;
    scrollingThreshold?: number;
    scrollXMarginOffset?: number;
    scrollYMarginOffset?: number;
    suppressScrollX?: boolean;
    suppressScrollY?: boolean;
    swipeEasing?: boolean;
    useBothWheelAxes?: boolean;
    wheelPropagation?: boolean;
    wheelSpeed?: number;
  }
}

declare class PerfectScrollbar {
  constructor(element: string | Element, options?: PerfectScrollbar.Options);

  update(): void;
  destroy(): void;

  containerHeight: number;
  containerWidth: number;
  contentHeight: number;
  contentWidth: number;
  element: HTMLElement;
  isAlive: boolean;
  isNegativeScroll: boolean;
  isRtl: boolean;
  isScrollbarXUsingBottom: boolean;
  isScrollbarYUsingBottom: boolean;
  lastScrollLeft: boolean;
  lastScrollTop: boolean;
  negativeScrollAdjustment: number;
  railBorderXWidth: number;
  railBorderYWidth: number;
  railXMarginWidth: number;
  railXRatio: number;
  railXWidth: number;
  railYHeight: number;
  railYMarginHeight: number;
  railYRatio: number;
  scrollbarX: HTMLElement;
  scrollbarXActive: boolean;
  scrollbarXBottom: number;
  scrollbarXLeft: number;
  scrollbarXRail: HTMLElement;
  scrollbarXWidth: number;
  scrollbarY: HTMLElement;
  scrollbarYActive: boolean;
  scrollbarYHeight: number;
  scrollbarYOuterWidth?: number;
  scrollbarYRail: HTMLElement;
  scrollbarYRight: number;
  scrollbarYTop: number;
  settings: PerfectScrollbar.Options;
  reach: { x: 'start' | 'end' | null; y: 'start' | 'end' | null };
}

export default PerfectScrollbar;
