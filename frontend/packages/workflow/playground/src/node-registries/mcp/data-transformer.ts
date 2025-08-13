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

import { type NodeData } from '@coze-workflow/base';

import { type FormData } from './types';
import { OUTPUTS, DEFAULT_INPUTS } from './constants';

/**
 * 节点后端数据 -> 前端表单数据转换
 */
export function transformOnInit(data: NodeData): FormData {
  return {
    inputs: {
      inputParameters: data?.inputParameters || DEFAULT_INPUTS,
    },
    outputs: data?.outputs || OUTPUTS,
  };
}

/**
 * 前端表单数据 -> 节点后端数据转换
 */
export function transformOnSubmit(data: FormData): NodeData {
  return {
    inputParameters: data.inputs.inputParameters,
    outputs: data.outputs?.length > 0 ? data.outputs : OUTPUTS,
  };
}
