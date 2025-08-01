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

import { type GlobalStyle, type LineStyle } from './typing';

export const defaultGlobalStyle: GlobalStyle = {
  indent: 24,
  verticalInterval: 16,
  nodeBoxHeight: 16,
  offsetX: 8,
};

export const defaultLineStyle: LineStyle = {
  normal: {
    stroke: '#ccc',
    strokeDasharray: '[]',
    strokeWidth: 2,
    lineRadius: 6,
    lineGap: 0,
  },
  select: {
    stroke: '#333',
  },
  hover: {
    stroke: '#d25e5a',
  },
};
