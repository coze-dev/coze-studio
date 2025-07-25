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
 
import { flatten } from 'lodash-es';
import {
  ValidateTrigger,
  type FormMetaV2,
} from '@flowgram-adapter/free-layout-editor';

import { nodeMetaValidate } from '@/nodes-v2/materials/node-meta-validate';
import {
  fireNodeTitleChange,
  provideNodeOutputVariablesEffect,
} from '@/node-registries/common/effects';
import { validateAllBranches } from '@/form-extensions/setters/condition/multi-condition/validate/validate';

import { type FormData } from './types';
import { FormRender } from './form';
import { transformOnInit, transformOnSubmit } from './data-transformer';
import { CONDITION_PATH } from './constants';

export const IF_FORM_META: FormMetaV2<FormData> = {
  // 节点表单渲染
  render: () => <FormRender />,

  // 验证触发时机
  validateTrigger: ValidateTrigger.onChange,

  // 验证规则
  validate: {
    nodeMeta: nodeMetaValidate,
    [CONDITION_PATH]: ({ value, context }) => {
      const { node, playgroundContext } = context;

      const res = validateAllBranches(value, node, playgroundContext);

      const msg = flatten(res).reduce((previousValue, currentValue) => {
        let _previousValue = previousValue;
        if (currentValue?.left?.message) {
          _previousValue = _previousValue
            ? `${_previousValue};${currentValue?.left?.message}`
            : currentValue?.left?.message;
        }

        if (currentValue?.operator?.message) {
          _previousValue = _previousValue
            ? `${_previousValue};${currentValue?.operator?.message}`
            : currentValue?.operator?.message;
        }

        if (currentValue?.right?.message) {
          _previousValue = _previousValue
            ? `${_previousValue};${currentValue?.right?.message}`
            : currentValue?.right?.message;
        }

        return _previousValue;
      }, '');

      return msg ? msg : undefined;
    },
  },

  // 副作用管理
  effect: {
    nodeMeta: fireNodeTitleChange,
    outputs: provideNodeOutputVariablesEffect,
  },

  // 节点后端数据 -> 前端表单数据
  formatOnInit: transformOnInit,

  // 前端表单数据 -> 节点后端数据
  formatOnSubmit: transformOnSubmit,
};
