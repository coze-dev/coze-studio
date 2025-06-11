import { memo } from 'react';

import { ViewVariableType } from '@coze-workflow/base';

import { type InputComponentRegistry } from './type';
import { InputTime } from './input-time';
import { InputString } from './input-string';
import { InputSelect } from './input-select';
import { InputNumber } from './input-number';
import { InputJson } from './input-json';
import { InputInteger } from './input-integer';
import { InputBoolean } from './input-boolean';

export const DEFAULT_COMPONENT_REGISTRY: InputComponentRegistry[] = [
  {
    canHandle: ViewVariableType.String,
    component: memo(InputString),
  },
  {
    canHandle: ViewVariableType.Number,
    component: memo(InputNumber),
  },
  {
    canHandle: ViewVariableType.Integer,
    component: memo(InputInteger),
  },
  {
    canHandle: ViewVariableType.Boolean,
    component: memo(InputBoolean),
  },
  {
    canHandle: ViewVariableType.Time,
    component: memo(InputTime),
  },
  {
    canHandle: inputType => ViewVariableType.isJSONInputType(inputType),
    component: memo(InputJson),
  },
  {
    canHandle: (inputType, optionsList) =>
      [ViewVariableType.String, ViewVariableType.Integer].includes(inputType) &&
      (optionsList ?? []).length > 0,
    component: memo(InputSelect),
  },
];
