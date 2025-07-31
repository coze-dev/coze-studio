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

import {
  exhaustiveCheckSimple,
  safeAsyncThrow,
} from '@coze-common/chat-area-utils';
import { type project_memory as ProjectMemory } from '@coze-arch/bot-api/memory';

import { type VariableSchemaDTO, VariableTypeDTO } from '../types';
import { type Variable } from '../store';

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

export function viewTypeToDTO(type: ViewVariableType): {
  type: VariableTypeDTO;
  arrayItemType?: VariableTypeDTO;
} {
  switch (type) {
    case ViewVariableType.Boolean:
      return { type: VariableTypeDTO.Boolean };
    case ViewVariableType.Integer:
      return { type: VariableTypeDTO.Integer };
    case ViewVariableType.Number:
      return { type: VariableTypeDTO.Float };
    case ViewVariableType.String:
      return { type: VariableTypeDTO.String };
    case ViewVariableType.Object:
      return { type: VariableTypeDTO.Object };
    case ViewVariableType.ArrayBoolean:
      return {
        type: VariableTypeDTO.List,
        arrayItemType: VariableTypeDTO.Boolean,
      };
    case ViewVariableType.ArrayInteger:
      return {
        type: VariableTypeDTO.List,
        arrayItemType: VariableTypeDTO.Integer,
      };
    case ViewVariableType.ArrayNumber:
      return {
        type: VariableTypeDTO.List,
        arrayItemType: VariableTypeDTO.Float,
      };
    case ViewVariableType.ArrayString:
      return {
        type: VariableTypeDTO.List,
        arrayItemType: VariableTypeDTO.String,
      };
    case ViewVariableType.ArrayObject:
      return {
        type: VariableTypeDTO.List,
        arrayItemType: VariableTypeDTO.Object,
      };
    default:
      exhaustiveCheckSimple(type);
      safeAsyncThrow(`Unknown view variable type: ${type}`);
      return { type: VariableTypeDTO.String };
  }
}

export const getDtoVariable = (
  viewVariable: Variable,
): ProjectMemory.Variable => {
  const { type, arrayItemType } = viewTypeToDTO(viewVariable.type);

  const schema: VariableSchemaDTO = {
    name: viewVariable.name,
    enable: viewVariable.enabled,
    description: viewVariable.description || '',
    type,
    readonly: Boolean(viewVariable.readonly),
    schema: '',
  };

  // Working with array types
  if (type === VariableTypeDTO.List && arrayItemType) {
    if (arrayItemType === VariableTypeDTO.Object) {
      schema.schema = {
        type: VariableTypeDTO.Object,
        schema: viewVariable.children?.map(child => {
          const childDTO = getDtoVariable(child);
          return JSON.parse(childDTO.Schema || '{}');
        }),
      };
    } else {
      schema.schema = {
        type: arrayItemType,
      };
    }
  }

  // Handling object types
  if (type === VariableTypeDTO.Object) {
    schema.schema = viewVariable.children?.map(child => {
      const childDTO = getDtoVariable(child);
      return JSON.parse(childDTO.Schema || '{}');
    });
  }

  return {
    Keyword: viewVariable.name,
    Channel: viewVariable.channel,
    VariableType: viewVariable.variableType ?? 1,
    DefaultValue: viewVariable.defaultValue,
    Description: viewVariable.description,
    EffectiveChannelList: viewVariable.effectiveChannelList,
    Enable: Boolean(viewVariable.enabled),
    IsReadOnly: Boolean(viewVariable.readonly),
    Schema: JSON.stringify(schema, null, 0),
  };
};
