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

import { get } from 'lodash-es';
import {
  ValidateTrigger,
  type FormMetaV2,
  type FlowNodeEntity,
} from '@flowgram-adapter/free-layout-editor';
import { WorkflowNodeData } from '@coze-workflow/nodes';
import { type StandardNodeType } from '@coze-workflow/base';

import { settingOnErrorValidate } from '@/nodes-v2/materials/setting-on-error-validate';
import { createProvideNodeBatchVariables } from '@/nodes-v2/materials/provide-node-batch-variable';
import { nodeMetaValidate } from '@/nodes-v2/materials/node-meta-validate';
import { createNodeInputNameValidate } from '@/nodes-v2/components/node-input-name/validate';
import { createValueExpressionInputValidate } from '@/node-registries/common/validators';
import {
  fireNodeTitleChange,
  provideNodeOutputVariablesEffect,
} from '@/node-registries/common/effects';

import { type FormData } from './types';
import { FormRender } from './form';
import { transformOnInit, transformOnSubmit } from './data-transformer';
import { BATCH_INPUT_LIST_PATH, BATCH_MODE_PATH } from './constants';

export const SUB_WORKFLOW_FORM_META: FormMetaV2<FormData> = {
  // 节点表单渲染
  render: props => <FormRender {...props} />,

  // 验证触发时机
  validateTrigger: ValidateTrigger.onChange,

  // 验证规则
  validate: {
    nodeMeta: nodeMetaValidate,
    // 校验入参
    'inputs.inputParameters.*': createValueExpressionInputValidate({
      // 是否必填需要根据函数来计算，获取对应字段的必填值
      required: ({ name, context }) => {
        const { node } = context;

        const subWorkflow = (node as FlowNodeEntity)
          .getData<WorkflowNodeData>(WorkflowNodeData)
          .getNodeData<StandardNodeType.SubWorkflow>();

        const fieldName = (name as string).replace(
          'inputs.inputParameters.',
          '',
        );

        const inputDef = subWorkflow?.inputsDefinition?.find(
          v => v.name === fieldName,
        );
        return Boolean(inputDef?.required);
      },
    }),

    // 校验批处理入参的名称
    'inputs.batch.inputLists.*.name': createNodeInputNameValidate({
      getNames: ({ formValues }) =>
        (get(formValues, 'batch.inputLists') || []).map(item => item.name),
      skipValidate: ({ formValues }) =>
        formValues?.inputs?.batchMode === 'single',
    }),

    // 校验批处理入参的值
    'inputs.batch.inputLists.*.input': createValueExpressionInputValidate({
      required: true,
      skipValidate: ({ formValues }) =>
        formValues?.inputs?.batchMode === 'single',
    }),

    settingOnError: settingOnErrorValidate,
  },

  // 副作用管理
  effect: {
    nodeMeta: fireNodeTitleChange,
    outputs: provideNodeOutputVariablesEffect,

    [BATCH_MODE_PATH]: createProvideNodeBatchVariables(
      BATCH_MODE_PATH,
      BATCH_INPUT_LIST_PATH,
    ),

    [BATCH_INPUT_LIST_PATH]: createProvideNodeBatchVariables(
      BATCH_MODE_PATH,
      BATCH_INPUT_LIST_PATH,
    ),
  },

  // 节点后端数据 -> 前端表单数据
  formatOnInit: transformOnInit,

  // 前端表单数据 -> 节点后端数据
  formatOnSubmit: transformOnSubmit,
};
