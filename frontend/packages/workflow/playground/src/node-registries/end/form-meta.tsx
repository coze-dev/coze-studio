import { get } from 'lodash-es';
import {
  ValidateTrigger,
  type FormMetaV2,
} from '@flowgram-adapter/free-layout-editor';

import { nodeMetaValidate } from '@/nodes-v2/materials/node-meta-validate';
import { createAnswerContentValidator } from '@/node-registries/common/validators';
import { fireNodeTitleChange } from '@/node-registries/common/effects';

import { createInputsValidator } from '../common/fields';
import { type FormData, TerminatePlan } from './types';
import { FormRender } from './form';
import { transformOnInit, transformOnSubmit } from './data-transformer';
export const END_FORM_META: FormMetaV2<FormData> = {
  // 节点表单渲染
  render: () => <FormRender />,

  // 验证触发时机
  validateTrigger: ValidateTrigger.onChange,

  // 验证规则
  validate: {
    nodeMeta: nodeMetaValidate,
    ...createInputsValidator(true),
    ['inputs.content']: createAnswerContentValidator({
      fieldEnabled: ({ formValues }) => {
        const terminatePlan = get(formValues, 'inputs.terminatePlan');
        return terminatePlan === TerminatePlan.UseAnswerContent;
      },
    }),
  },

  // 副作用管理
  effect: {
    nodeMeta: fireNodeTitleChange,
  },

  // 节点后端数据 -> 前端表单数据
  formatOnInit: transformOnInit,

  // 前端表单数据 -> 节点后端数据
  formatOnSubmit: transformOnSubmit,
};
