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

/* eslint-disable @typescript-eslint/no-explicit-any */
import { type FC } from 'react';

import { Select } from '@coze-arch/coze-design';

import { Uploader } from './uploader';
import { TextType } from './text-type';
import { TextFamily } from './text-family';
import { TextAlign } from './text-align';
import { SingleSelect } from './single-select';
import { RefSelect } from './ref-select';
import { LineHeight } from './line-height';
import { LabelSelect } from './label-select';
import { InputNumber } from './input-number';
import { FontSize } from './font-size';
import { ColorPicker } from './color-picker';
import { BorderWidth } from './border-width';

export const setters: Record<string, FC<any>> = {
  ColorPicker,
  TextAlign,
  InputNumber,
  TextType,
  SingleSelect,
  BorderWidth,
  Select,
  TextFamily,
  FontSize,
  LineHeight,
  LabelSelect,
  Uploader,
  RefSelect,
};
