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

import { type CSSProperties } from 'react';

import {
  type InteractionEventHandler,
  type TooltipSpec,
  type ViewSpec,
  type IElement,
} from '@visactor/vgrammar';

export type { IElement, InteractionEventHandler, TooltipSpec };

export interface RectStyleAttrs {
  fill?: string;
  stroke?: string;
  lineWidth?: number;
  lineDash?: number[];
}

export interface RectStyle {
  normal?: RectStyleAttrs;
  hover?: RectStyleAttrs;
  select?: RectStyleAttrs;
}

export interface LabelStyle {
  position?: string;
  fontSize?: number;
  fill?: string;
}

export interface RectNode {
  key: string;
  rowNo: number;
  start: number;
  end: number;
  rectStyle?: RectStyle;
  labelStyle?: Pick<LabelStyle, 'fill'>;
  // Other fields will be passed through
  extra?: unknown;
}

export type Tooltip = Pick<TooltipSpec, 'title' | 'content'>;

export type GlobalStyle = Pick<CSSProperties, 'width' | 'height'> &
  Pick<ViewSpec, 'padding' | 'background'>;

export type LabelText = (
  datum: RectNode,
  element: IElement,
  params: unknown,
) => string;

export interface FlamethreadProps {
  flamethreadData: RectNode[];
  rectStyle?: RectStyle;
  labelStyle?: LabelStyle;
  labelText?: LabelText;
  // The structure is too complicated, just leak it directly
  tooltip?: Tooltip;
  globalStyle?: GlobalStyle;
  rowHeight?: number;
  visibleColumnCount?: number;
  // valuePerColumn?: number;
  datazoomDecimals?: number;
  axisLabelSuffix?: string;
  selectedKey?: string;
  disableViewScroll?: boolean;
  enableAutoFit?: boolean;
  onClick?: InteractionEventHandler;
}
