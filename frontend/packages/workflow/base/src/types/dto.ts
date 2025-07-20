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
 * 这些是迁移的变量定义，可以不用关注
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

  // 当 schema 为 string 时表示原始的 FDL 类型export type ListVariableSchema = VariableTypeDef & Omit<VariableOption, 'name'>
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
 * 后端定义的表达式格式
 * @example
 * - literal
 * {
 *     type: 'string',
 *     value: {
 *         type: 'liteal',
 *         content: '浙江'
 *     }
 * }
 *
 * - ref
 * // 普通引用类型
 * {
 *     type: 'string', // 由引用的变量类型判断
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
 * // list or object 引用类型
 * {
 *     type: 'list', // 由引用的变量路径的最后一个值类型判断, 如果list.a.c, 则为c的格式
 *     schema: { // 只有list和object有schema
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
 *             name: 'list.a.c' // 这里存的是引用的路径
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
   * 空引用
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
 * 后端的变量格式
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
   * 变量类型
   */
  type: VariableTypeDTO;
  /**
   * 辅助类型，如：string 类型的变量可以是 file 或者 image
   */
  assistType?: AssistTypeDTO;
  /**
   * 变量名，在节点内不可重复
   */
  name: string;
  /**
   * 变量数据结构，仅object 和 list 类型变量有
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
  // 初始化后存在，服务端数据不存在
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
