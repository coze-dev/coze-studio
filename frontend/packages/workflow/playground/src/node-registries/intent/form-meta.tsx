import { get } from 'lodash-es';
import {
  ValidateTrigger,
  type FormMetaV2,
  DataEvent,
} from '@flowgram-adapter/free-layout-editor';
import { INTENT_NODE_MODE } from '@coze-workflow/nodes';

import { nodeMetaValidate } from '@/nodes-v2/materials/node-meta-validate';
import { validateIntentsName } from '@/node-registries/intent/validator';
import { createValueExpressionInputValidate } from '@/node-registries/common/validators';
import {
  fireNodeTitleChange,
  provideNodeOutputVariablesEffect,
} from '@/node-registries/common/effects';

import { type FormData } from './types';
import { FormRender } from './form';
import { handleIntentModeChange } from './effects/intent-mode-effect';
import { transformOnInit, transformOnSubmit } from './data-transformer';
import { INTENT_MODE, INTENTS, QUICK_INTENTS } from './constants';
export const INTENT_FORM_META: FormMetaV2<FormData> = {
  // 节点表单渲染
  render: () => <FormRender />,

  // 验证触发时机
  validateTrigger: ValidateTrigger.onChange,

  // 验证规则
  validate: {
    nodeMeta: nodeMetaValidate,
    // 必填
    'inputs.inputParameters.0.input': createValueExpressionInputValidate({
      required: true,
    }),
    [`${INTENTS}.*`]: ({ value, formValues, name }) => {
      if (get(formValues, INTENT_MODE) === INTENT_NODE_MODE.STANDARD) {
        return validateIntentsName(value, get(formValues, INTENTS), name);
      }

      return undefined;
    },
    [`${QUICK_INTENTS}.*`]: ({ value, formValues, name }) => {
      if (get(formValues, INTENT_MODE) === INTENT_NODE_MODE.MINIMAL) {
        return validateIntentsName(value, get(formValues, QUICK_INTENTS), name);
      }
      return undefined;
    },
  },

  // 副作用管理
  effect: {
    nodeMeta: fireNodeTitleChange,
    outputs: provideNodeOutputVariablesEffect,
    [INTENT_MODE]: [
      {
        effect: handleIntentModeChange,
        event: DataEvent.onValueChange,
      },
    ],
  },

  // 节点后端数据 -> 前端表单数据
  formatOnInit: transformOnInit,

  // 前端表单数据 -> 节点后端数据
  formatOnSubmit: transformOnSubmit,
};
