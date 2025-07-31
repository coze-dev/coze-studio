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
 * Node Backend Data - > Frontend Form Data
 */
export const createTransformOnInit =
  (
    defaultInputValue: InputValueVO[] = [],
    defaultOutputValue: ViewVariableTreeNode[] = [],
  ) =>
  (value: NodeDataDTO) => {
    const { inputs, outputs } = value || {};
    const inputParameters = inputs?.inputParameters || [];

    // Since variables that are not filled in will be filtered out during commit, the default value needs to be added during initialization
    // See also: packages/workflow/nodes/src/workflow-json-format: 241
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
