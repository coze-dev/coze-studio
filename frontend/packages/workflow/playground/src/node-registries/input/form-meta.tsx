/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  ValidateTrigger,
  type FormMetaV2,
} from '@flowgram-adapter/free-layout-editor';

import { nodeMetaValidate } from '@/nodes-v2/materials/node-meta-validate';
import { createOutputsValidator } from '@/node-registries/common/validators';
import {
  fireNodeTitleChange,
  provideNodeOutputVariablesEffect,
} from '@/node-registries/common/effects';

import { type FormData } from './types';
import { FormRender } from './form';
import { transformOnSubmit } from './data-transformer';
import { OUTPUTS } from './constants';

export const INPUT_FORM_META: FormMetaV2<FormData> = {
  // 节点表单渲染
  render: () => <FormRender />,

  // 验证触发时机
  validateTrigger: ValidateTrigger.onChange,

  // 验证规则
  validate: {
    nodeMeta: nodeMetaValidate,
    // 必填
    outputs: createOutputsValidator({ uniqueName: true }),
  },

  defaultValues: {
    outputs: OUTPUTS,
  } as any,
  // 副作用管理
  effect: {
    nodeMeta: fireNodeTitleChange,
    outputs: provideNodeOutputVariablesEffect,
  },

  // 前端表单数据 -> 节点后端数据
  formatOnSubmit: transformOnSubmit,
};
