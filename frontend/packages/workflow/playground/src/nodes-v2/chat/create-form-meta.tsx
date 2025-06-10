import React from 'react';

import {
  ValidateTrigger,
  type FormMetaV2,
} from '@flowgram-adapter/free-layout-editor';
import { type InputValueVO } from '@coze-workflow/base';

import { fireNodeTitleChange } from '@/nodes-v2/materials/fire-node-title-change';
import { createValueExpressionInputValidate } from '@/nodes-v2/materials/create-value-expression-input-validate';

import { provideNodeOutputVariablesEffect } from '../materials/provide-node-output-variables';
import { transformOnSubmit } from './transform-on-submit';
import { createTransformOnInit } from './transform-on-init';
import { syncConversationNameEffect } from './sync-conversation-name-effect';

interface ChatFormData {
  inputParameters: InputValueVO[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

export const createFormMeta = ({
  fieldConfig,
  needSyncConversationName,
  defaultInputValue,
  defaultOutputValue,
  formRenderComponent,
  customValidators = {},
}): FormMetaV2<ChatFormData> => {
  // 定义首字母大写的变量引用组件
  const FormRender = formRenderComponent;

  const formMeta = {
    // 节点表单渲染
    render: () => <FormRender />,

    // 验证触发时机
    validateTrigger: ValidateTrigger.onChange,

    // 验证规则
    validate: {
      // 必填
      'inputParameters.*.input': createValueExpressionInputValidate({
        required: ({ name }) => {
          const fieldName = name
            .replace('inputParameters.', '')
            .replace('.input', '');

          return Boolean(fieldConfig[fieldName]?.required);
        },
      }),
      ...customValidators,
    },

    // 副作用管理
    effect: {
      nodeMeta: fireNodeTitleChange,
      outputs: provideNodeOutputVariablesEffect,
    },

    // 节点后端数据 -> 前端表单数据
    formatOnInit: createTransformOnInit(defaultInputValue, defaultOutputValue),

    // 前端表单数据 -> 节点后端数据
    formatOnSubmit: transformOnSubmit,
  };

  // 需要同步联动 CONVERSATION_NAME 字段的值
  if (needSyncConversationName) {
    Object.assign(formMeta.effect, {
      inputParameters: syncConversationNameEffect,
    });
  }

  return formMeta;
};
