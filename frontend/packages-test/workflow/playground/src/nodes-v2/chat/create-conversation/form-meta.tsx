import {
  ValidateTrigger,
  type FormMetaV2,
} from '@flowgram-adapter/free-layout-editor';
import { type InputValueVO } from '@coze-workflow/base';

import { fireNodeTitleChange } from '@/nodes-v2/materials/fire-node-title-change';
import { createValueExpressionInputValidate } from '@/nodes-v2/materials/create-value-expression-input-validate';

import { transformOnSubmit } from '../transform-on-submit';
import { createTransformOnInit } from '../transform-on-init';
import { provideNodeOutputVariablesEffect } from '../../materials/provide-node-output-variables';
import FormRender from './form-render';
import { DEFAULT_CONVERSATION_VALUE, DEFAULT_OUTPUTS } from './constants';

interface FormData {
  inputParameters: InputValueVO[];
}

export const CREATE_CONVERSATION_FORM_META: FormMetaV2<FormData> = {
  // 节点表单渲染
  render: () => <FormRender />,

  // 验证触发时机
  validateTrigger: ValidateTrigger.onChange,

  // 验证规则
  validate: {
    // 必填
    'inputParameters.0.input': createValueExpressionInputValidate({
      required: true,
    }),
  },

  // 副作用管理
  effect: {
    nodeMeta: fireNodeTitleChange,
    outputs: provideNodeOutputVariablesEffect,
  },

  // 节点后端数据 -> 前端表单数据
  formatOnInit: createTransformOnInit(
    DEFAULT_CONVERSATION_VALUE,
    DEFAULT_OUTPUTS,
  ),

  // 前端表单数据 -> 节点后端数据
  formatOnSubmit: transformOnSubmit,
};
