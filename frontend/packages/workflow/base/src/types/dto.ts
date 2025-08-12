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

/**
 * These are the variable definitions for migration, you can ignore them.
 */

import { type ValueExpressionRawMeta } from './vo';
import { type StandardNodeType } from './node-type';
// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace DTODefine {
  export type LiteralExpressionContent =
    | string
    | number
    | boolean
    | Array<unknown>;

  export interface LiteralExpression {
    type: 'literal';
    content?: LiteralExpressionContent;
    rawMeta?: ValueExpressionRawMeta;
  }

  export type RefExpressionContent =
    | {
        source: 'variable';
        blockID: undefined;
        name: string;
      }
    | {
        source: 'block-output';
        blockID: string;
        name: string;
      }
    | {
        source: `global_variable_${string}`;
        path: string[];
        blockID: string;
        name: string;
      };
  export interface RefExpression {
    type: 'ref';
    content?: RefExpressionContent;
    rawMeta?: ValueExpressionRawMeta;
  }

  export interface ObjectRefExpression {
    type: 'object_ref';
    content?: unknown;
    rawMeta?: ValueExpressionRawMeta;
  }

  // Represents the original FDL type when schema is string export type ListVariableSchema = VariableTypeDef & Omit < VariableOption, 'name' >
  export type ObjectVariableSchema = InputVariableDTO[];
  export type ListVariableSchema = VariableTypeDef &
    Omit<VariableOption, 'name'>;
  export type VariableSchema = ListVariableSchema | ObjectVariableSchema;
  export type BasicVariableType =
    | 'string'
    | 'integer'
    | 'float'
    | 'boolean'
    | 'image'
    | 'unknown';
  export type ComplexVariableType = 'object' | 'list';
  export type VariableType = BasicVariableType | ComplexVariableType;

  export interface BasicVarTypeDef {
    type: BasicVariableType;
    assistType?: AssistTypeDTO;
  }
  export interface ObjectVarTypeDef {
    type: VariableTypeDTO.object;
    schema?: ObjectVariableSchema;
    assistType?: AssistTypeDTO;
  }
  export interface ListVarTypeDef {
    type: VariableTypeDTO.list;
    schema: ListVariableSchema;
    assistType?: AssistTypeDTO;
  }

  export type VariableTypeDef =
    | BasicVarTypeDef
    | ObjectVarTypeDef
    | ListVarTypeDef;
  interface VariableOption {
    name: string;
    label?: string;
    defaultValue?: LiteralExpressionContent;
    description?: string;
    required?: boolean;
  }

  export type InputVariableDTO = VariableOption & VariableTypeDef;
}

/**
 * Expression formats defined by the backend
 * @example
 * - literal
 * {
 *     type: 'string',
 *     value: {
 *         type: 'liteal',
 *         Content: 'Zhejiang'
 *     }
 * }
 *
 * - ref
 * //Common reference typery reference type
 * {
 *     Type: 'string',//Determined by the type of the referenced variable the type of variable being referenced
 *     value: {
 *         type: 'ref',
 *         content: {
 *             source: 'block-output',
 *             blockID: '1002',
 *             name: 'result'
 *         }
 *     }
 * }
 *
 * //list or object reference typerence type
 * {
 *     Type: 'list',//Determined by the last value type of the referenced variable path, if list.a.c, the format of che referenced variable path, if list.a.c, the format of c
 *     Schema : { // only list and object have schemasts have schemas
 *          type: 'object',
 *          schema: [
 *             { name: 'role', type: 'string' },
 *             { name: 'content', type: 'string' }
 *          ]
 *     }
 *     value: {
 *         type: 'ref',
 *         content: {
 *             source: 'block-output',
 *             blockID: '1002',
 *             Name: 'list.a.c'//Here is the path of the referencee path to the reference
 *         },
 *     }
 * }
 */
export interface ValueExpressionDTO {
  type?: string;
  assistType?: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  schema?: any;
  value:
    | DTODefine.LiteralExpression
    | DTODefine.RefExpression
    | DTODefine.ObjectRefExpression;
}

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace ValueExpressionDTO {
  /**
   * null reference
   */
  export function createEmpty(): ValueExpressionDTO {
    return {
      type: 'string',
      value: {
        type: 'ref',
        content: {
          source: 'block-output',
          blockID: '',
          name: '',
        },
      },
    };
  }
}
export interface InputValueDTO {
  name?: string;
  input: ValueExpressionDTO;
  schema?: InputValueDTO[];
  id?: string;
}

export enum VariableTypeDTO {
  object = 'object',
  list = 'list',
  string = 'string',
  integer = 'integer',
  float = 'float',
  boolean = 'boolean',
  image = 'image',
  time = 'time',
}

export enum AssistTypeDTO {
  file = 1,
  image = 2,
  doc = 3,
  code = 4,
  ppt = 5,
  txt = 6,
  excel = 7,
  audio = 8,
  zip = 9,
  video = 10,
  svg = 11,
  voice = 12,
  time = 10000,
}

/**
 * Variable format for the backend
 * @example
 * 1. simple
 *  {
 *    name: 'message',
 *    type: 'string'
 *  }
 * 2. object
 *  {
 *    name: 'someObj'
 *    type: 'object',
 *    schema: [
 *      {
 *        name: 'role',
 *        type: 'string'
 *      },
 *      {
 *        name: 'content',
 *        type: 'string'
 *      }
 *    ]
 *  }
 * 3. list<object>
 *   {
 *     name: 'history'
 *     type: 'list',
 *     schema: {
 *       type: 'object',
 *       schema: [
 *         { name: 'role', type: 'string' },
 *         { name: 'content', type: 'string' }
 *       ]
 *     }
 *   }
 */
export interface VariableMetaDTO {
  /**
   * Variable type
   */
  type: VariableTypeDTO;
  /**
   * Auxiliary types, such as: string type variables can be file or image
   */
  assistType?: AssistTypeDTO;
  /**
   * Variable names are not repeatable within a node
   */
  name: string;
  /**
   * Variable data structures, only object and list variables are available
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  schema?: any; // BlockVariableDefine.ObjectVariableSchema | BlockVariableDefine.ListVariableSchema
  required?: boolean;
  description?: string;
  readonly?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  defaultValue?: any;
}

export interface BatchDTOInputList {
  name?: string;
  input: ValueExpressionDTO;
  // Exists after initialization, server level data does not exist
  id?: string;
}

export interface BatchDTO {
  batchSize: number;
  concurrentSize: number;
  inputLists: BatchDTOInputList[];
}

export interface NodeDataDTO {
  inputs: {
    inputParameters?: InputValueDTO[];
    settingOnError?: { switch: boolean; dataOnErr: string };
    [key: string]: unknown;
  };
  nodeMeta: {
    description: string;
    icon: string;
    subTitle: string;
    title: string;
    mainColor: string;
  };
  outputs: VariableMetaDTO[];
  version?: string;
}

export interface NodeDTO {
  id: string;
  type: StandardNodeType;
  meta?: {
    position: { x: number; y: number };
    [key: string]: unknown;
  };
  data: NodeDataDTO;
  edges?: {
    sourceNodeId: string;
    targetNodeId: string;
    sourcePortId: string;
  }[];
  blocks?: NodeDataDTO[];
}

export interface InputTypeValueDTO {
  name: string;
  type: VariableTypeDTO;
  input: ValueExpressionDTO;
}
