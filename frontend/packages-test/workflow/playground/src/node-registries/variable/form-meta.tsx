import { I18n } from '@coze-arch/i18n';
import {
  ValidateTrigger,
  type FormMetaV2,
} from '@flowgram-adapter/free-layout-editor';

import { provideNodeOutputVariablesEffect } from '@/nodes-v2/materials/provide-node-output-variables';
import { fireNodeTitleChange } from '@/nodes-v2/materials/fire-node-title-change';
import { createValueExpressionInputValidate } from '@/nodes-v2/materials/create-value-expression-input-validate';

import type { FormData } from './types';
import FormRender from './form';
import { transformOnInit, transformOnSubmit } from './data-transformer';

const INPUT_PARAMETERS_FIELD_NAME = 'inputParameters.*.name';

export const VARIABLE_NODE_FORM_META: FormMetaV2<FormData> = {
  // 节点表单渲染
  render: () => <FormRender />,

  // 验证触发时机
  validateTrigger: ValidateTrigger.onChange,

  // 验证规则
  validate: {
    [INPUT_PARAMETERS_FIELD_NAME]: ({ value }) => {
      if (/^.+$/.test(value)) {
        return undefined;
      }
      return I18n.t('bot_edit_variable_field_required_error');
    },
    'inputParameters.*.input': createValueExpressionInputValidate({
      required: true,
    }),
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
