import {
  ValidateTrigger,
  type FormMetaV2,
} from '@flowgram-adapter/free-layout-editor';

import { nodeMetaValidate } from '@/nodes-v2/materials/node-meta-validate';
import {
  fireNodeTitleChange,
  provideLoopInputsVariablesEffect,
  provideLoopOutputsVariablesEffect,
} from '@/node-registries/common/effects';

import {
  BatchInputNameValidator,
  BatchInputValueValidator,
  BatchOutputNameValidator,
} from './validators';
import { type FormData } from './types';
import { BatchFormRender } from './form';
import { transformOnInit, transformOnSubmit } from './data-transformer';
import { BatchPath } from './constants';

export const BATCH_FORM_META: FormMetaV2<FormData> = {
  // 节点表单渲染
  render: () => <BatchFormRender />,

  // 验证触发时机
  validateTrigger: ValidateTrigger.onChange,

  // 验证规则
  validate: {
    nodeMeta: nodeMetaValidate,
    [`${BatchPath.Inputs}.*.name`]: BatchInputNameValidator,
    [`${BatchPath.Inputs}.*.input`]: BatchInputValueValidator,
    [`${BatchPath.Outputs}.*.name`]: BatchOutputNameValidator,
    [`${BatchPath.Outputs}.*.input`]: BatchInputValueValidator,
  },

  // 副作用管理
  effect: {
    nodeMeta: fireNodeTitleChange,
    inputs: provideLoopInputsVariablesEffect,
    outputs: provideLoopOutputsVariablesEffect,
  },

  // 节点后端数据 -> 前端表单数据
  formatOnInit: transformOnInit,

  // 前端表单数据 -> 节点后端数据
  formatOnSubmit: transformOnSubmit,
};
