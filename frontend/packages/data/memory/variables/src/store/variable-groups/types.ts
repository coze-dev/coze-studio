/*
 * Copyright 2025 coze-dev Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

export enum VariableTypeDTO {
  Object = 'object',
  List = 'list',
  String = 'string',
  Integer = 'integer',
  Boolean = 'boolean',
  Float = 'float',
}

export interface VariableSchemaDTO {
  type: VariableTypeDTO;
  name: string;
  enable: boolean;
  description: string;
  readonly: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  schema?: any;
}

/**
 * Front-end variable type
 */
export enum ViewVariableType {
  String = 1,
  Integer,
  Boolean,
  Number,
  Object = 6,
  // The above is the InputType defined in the api. The following is the integrated one. Start from 99 to avoid collisions with the backend definition.
  ArrayString = 99,
  ArrayInteger,
  ArrayBoolean,
  ArrayNumber,
  ArrayObject,
}

export const BASE_ARRAY_PAIR: [ViewVariableType, ViewVariableType][] = [
  [ViewVariableType.String, ViewVariableType.ArrayString],
  [ViewVariableType.Integer, ViewVariableType.ArrayInteger],
  [ViewVariableType.Boolean, ViewVariableType.ArrayBoolean],
  [ViewVariableType.Number, ViewVariableType.ArrayNumber],
  [ViewVariableType.Object, ViewVariableType.ArrayObject],
];

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
// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace ViewVariableType {
  /**
   * Get the complement of all variable types
   * @param inputTypes
   */
  export function getComplement(inputTypes: ViewVariableType[]) {
    const allTypes: ViewVariableType[] = [
      ...BASE_ARRAY_PAIR.map(_pair => _pair[0]),
      ...BASE_ARRAY_PAIR.map(_pair => _pair[1]),
    ];

    return allTypes.filter(type => !inputTypes.includes(type));
  }

  export function isArrayType(type: ViewVariableType): boolean {
    const arrayTypes = BASE_ARRAY_PAIR.map(_pair => _pair[1]);
    return arrayTypes.includes(type);
  }
}
// eslint-disable-next-line @typescript-eslint/naming-convention
export const ObjectLikeTypes = [
  ViewVariableType.Object,
  ViewVariableType.ArrayObject,
];
