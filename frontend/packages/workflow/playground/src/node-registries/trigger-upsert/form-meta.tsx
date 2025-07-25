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
 
/* eslint-disable @typescript-eslint/naming-convention */
import {
  ValidateTrigger,
  type FormMetaV2,
} from '@flowgram-adapter/free-layout-editor';

import { TriggerService } from '@/services';
import { nodeMetaValidate } from '@/nodes-v2/materials/node-meta-validate';
import { createValueExpressionInputValidate } from '@/node-registries/common/validators';
import {
  fireNodeTitleChange,
  provideNodeOutputVariablesEffect,
} from '@/node-registries/common/effects';

import { undefinedChecker } from './utils';
import { type NodeDataVO } from './types';
import { FormRender } from './form';
import { transformOnInit, transformOnSubmit } from './data-transformer';
import { OUTPUTS } from './constants';

export const TRIGGER_UPSERT_FORM_META: FormMetaV2<Partial<NodeDataVO>> = {
  // 节点表单渲染
  render: () => <FormRender />,

  defaultValues: context => {
    const triggerService =
      context.node.getService<TriggerService>(TriggerService);
    const { triggerNodeDefaultFormValue } =
      triggerService.getTriggerDynamicFormMeta();

    return {
      inputs: {
        fixedInputs: {},
        dynamicInputs: triggerNodeDefaultFormValue,
        payload: {},
      },
      outputs: OUTPUTS,
    };
  },
  // 验证触发时机
  validateTrigger: ValidateTrigger.onChange,

  // 验证规则
  validate: {
    nodeMeta: nodeMetaValidate,
    'inputs.fixedInputs.userId': createValueExpressionInputValidate({
      required: true,
    }),
    'inputs.fixedInputs.triggerName': createValueExpressionInputValidate({
      required: true,
    }),
    'inputs.bindWorkflowId': ({ value }) => undefinedChecker(value),
    // 必填
    'inputs.dynamicInputs.timeZone': createValueExpressionInputValidate({
      required: true,
    }),
    'inputs.dynamicInputs.crontab': props =>
      createValueExpressionInputValidate({
        required: true,
      })({
        ...props,
        value: props.value?.content,
      }),

    'inputs.payload.*': ({ value, formValues, context, name }) => {
      const bindWorkflowId = formValues?.inputs?.bindWorkflowId;
      if (!bindWorkflowId) {
        return undefined;
      }
      const triggerService =
        context.node.getService<TriggerService>(TriggerService);
      const bindWorkflowInfo =
        triggerService.getBindWorkflowInfo(bindWorkflowId);
      const required = (
        bindWorkflowInfo?.inputs as { name: string; required: boolean }[]
      )?.find(d => d.name === name?.replace('inputs.payload.', ''))?.required;
      if (required) {
        return undefinedChecker(value);
      }
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
