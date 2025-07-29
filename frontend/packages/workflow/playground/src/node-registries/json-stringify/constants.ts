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

import { nanoid } from 'nanoid';
import { ViewVariableType } from '@coze-workflow/variable';

// 入参路径，试运行等功能依赖该路径提取参数
export const INPUT_PATH = 'inputs.inputParameters';

// 定义固定出参
export const OUTPUTS = [
  {
    key: nanoid(),
    name: 'output',
    type: ViewVariableType.String,
  },
];

export const DEFAULT_INPUTS = [{ name: 'input' }];
