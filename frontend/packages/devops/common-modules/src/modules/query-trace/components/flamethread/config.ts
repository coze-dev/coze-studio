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

import {
  type GlobalStyle,
  type RectStyle,
  type LabelStyle,
  type LabelText,
} from './typing';

export const defaultRectStyle: RectStyle = {
  normal: {
    fill: '#F7F7FA',
    stroke: '#1D1C2314',
    lineWidth: 1,
    lineDash: [],
  },
  hover: {
    lineWidth: 1,
    lineDash: [],
  },
  select: {
    lineWidth: 1,
    lineDash: [],
  },
};

export const defaultGlobalStyle: GlobalStyle = {
  height: '100%',
  width: '100%',
  padding: {
    top: 0,
    right: 24,
    bottom: 24,
    left: 0,
  },
};

export const defaultDatazoomDecimals = 1;

export const defaultVisibleRowCount = 6;
export const defaultRowHeight = 42;
export const defaultVisibleColumnCount = 6; // 13 // 8

export const defaultLabelStyle: LabelStyle = {
  position: 'inside-left',
  fontSize: 12,
  fill: '#212629',
};

export const defaultLabelText: LabelText = (datum, element, params) =>
  `${datum.start}-${datum.end}`;

// padding of xScale (solve the problem of rect border being truncated after hover)
export const scrollbarMargin = 10;
export const datazoomHeight = 20;
export const datazoomDecimals = 0;
export const datazoomPaddingBottom = 18;
