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
 
import { type FormData, type NodeDataDTO } from './types';
import { get, set } from 'lodash-es';
import { VariableTypeDTO } from '@coze-workflow/base';

/**
 * 节点后端数据 -> 前端表单数据
 */
export const transformOnInit = (value: NodeDataDTO) => {
  const finalValue = {
    ...value,
    inputs: {
      ...value?.inputs,
      content: get(value, 'inputs.content.value.content') as string | undefined,
    },
  };
  // 设置各字段初始值
  if (typeof finalValue.inputs.inputParameters === 'undefined') {
    set(finalValue, 'inputs.inputParameters', [{ name: 'output' }]);
  }
  return finalValue;
};

/**
 * 前端表单数据 -> 节点后端数据
 * @param value
 * @returns
 */
export const transformOnSubmit = (value: FormData) => {
  return {
    ...value,
    inputs: {
      ...value.inputs,
      content: {
        type: VariableTypeDTO.string,
        value: {
          type: 'literal',
          content: value.inputs.content,
        }
      }
    }
  }
};
