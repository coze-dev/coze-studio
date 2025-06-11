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
  LoopArrayNameValidator,
  LoopArrayValueValidator,
  LoopInputNameValidator,
  LoopInputValueValidator,
  LoopOutputNameValidator,
} from './validators';
import { type FormData } from './types';
import { LoopFormRender } from './form';
import { transformOnInit, transformOnSubmit } from './data-transformer';
import { LoopPath } from './constants';

export const LOOP_FORM_META: FormMetaV2<FormData> = {
  // 节点表单渲染
  render: () => <LoopFormRender />,

  // 验证触发时机
  validateTrigger: ValidateTrigger.onChange,

  // 验证规则
  validate: {
    nodeMeta: nodeMetaValidate,
    [`${LoopPath.LoopArray}.*.name`]: LoopArrayNameValidator,
    [`${LoopPath.LoopArray}.*.input`]: LoopArrayValueValidator,
    [`${LoopPath.LoopVariables}.*.name`]: LoopInputNameValidator,
    [`${LoopPath.LoopVariables}.*.input`]: LoopInputValueValidator,
    [`${LoopPath.LoopOutputs}.*.name`]: LoopOutputNameValidator,
    [`${LoopPath.LoopOutputs}.*.input`]: LoopInputValueValidator,
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
