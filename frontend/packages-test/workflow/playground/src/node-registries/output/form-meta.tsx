import {
  ValidateTrigger,
  type FormMetaV2,
} from '@flowgram-adapter/free-layout-editor';

import { fireNodeTitleChange } from '@/node-registries/common/effects';
import { nodeMetaValidate } from '@/nodes-v2/materials/node-meta-validate';

import { type FormData } from './types';
import { FormRender } from './form';
import { transformOnInit, transformOnSubmit } from './data-transformer';
import { createInputsValidator } from '../common/fields';

export const OUTPUT_FORM_META: FormMetaV2<FormData> = {
  // 节点表单渲染
  render: () => <FormRender />,

  // 验证触发时机
  validateTrigger: ValidateTrigger.onChange,

  // 验证规则
  validate: {
    nodeMeta: nodeMetaValidate,
    ...createInputsValidator(true),
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
