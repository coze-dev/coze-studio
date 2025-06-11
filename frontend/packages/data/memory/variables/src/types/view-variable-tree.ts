import { type CSSProperties } from 'react';

import { ViewVariableType } from '../store';

export type WithCustomStyle<T = object> = {
  className?: string;
  style?: CSSProperties;
} & T;

export const VARIABLE_TYPE_ALIAS_MAP: Record<ViewVariableType, string> = {
  [ViewVariableType.String]: 'String',
  [ViewVariableType.Integer]: 'Integer',
  [ViewVariableType.Boolean]: 'Boolean',
  [ViewVariableType.Number]: 'Number',
  [ViewVariableType.Object]: 'Object',
  [ViewVariableType.ArrayString]: 'Array<String>',
  [ViewVariableType.ArrayInteger]: 'Array<Integer>',
  [ViewVariableType.ArrayBoolean]: 'Array<Boolean>',
  [ViewVariableType.ArrayNumber]: 'Array<Number>',
  [ViewVariableType.ArrayObject]: 'Array<Object>',
};
