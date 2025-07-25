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
 
import omit from 'lodash-es/omit';
import {
  type InputValueVO,
  type ViewVariableTreeNode,
  type NodeDataDTO,
} from '@coze-workflow/base';

const isEmptyArrayOrNil = (value: unknown) =>
  // eslint-disable-next-line eqeqeq
  (Array.isArray(value) && value.length === 0) || value == null;
/**
 * 节点后端数据 -> 前端表单数据
 */
export const createTransformOnInit =
  (
    defaultInputValue: InputValueVO[] = [],
    defaultOutputValue: ViewVariableTreeNode[] = [],
  ) =>
  (value: NodeDataDTO) => {
    const { inputs, outputs } = value || {};
    const inputParameters = inputs?.inputParameters || [];

    // 由于在提交时，会将没有填值的变量给过滤掉，所以需要在初始化时，将默认值补充进来
    // 参见：packages/workflow/nodes/src/workflow-json-format.ts:241
    const refillInputParamters = defaultInputValue.map(cur => {
      const { name } = cur;
      const target = inputParameters.find(item => item.name === name);
      if (target) {
        return target;
      }
      return cur;
    }, []);

    const initValue = {
      ...omit(value, ['inputs']),
      inputParameters: refillInputParamters,
      outputs: isEmptyArrayOrNil(outputs) ? defaultOutputValue : outputs,
    };

    return initValue;
  };
