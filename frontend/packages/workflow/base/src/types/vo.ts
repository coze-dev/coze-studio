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
 * 这个文件定义的是前端消费的数据, 用 VO (view object) 来表示
 */
import { isNil, isUndefined } from 'lodash-es';

import type { ViewVariableType } from './view-variable-type';

export interface RefExpressionContent {
  /**
   * 引用值是一个变量的 key 路径
   */
  keyPath: string[];
}

/**
 * 值表达式类型
 */
export enum ValueExpressionType {
  LITERAL = 'literal',
  REF = 'ref',
  OBJECT_REF = 'object_ref',
}
/**
 * 用来存储 ValueExpression 的原始数据供前端消费
 */
export interface ValueExpressionRawMeta {
  type?: ViewVariableType;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

/**
 * 文本表达式
 */
export interface LiteralExpression {
  type: ValueExpressionType.LITERAL;
  content?: string | number | boolean | Array<unknown>;
  rawMeta?: ValueExpressionRawMeta;
}

/**
 * 对象表达式
 */
export interface ObjectRefExpression {
  type: ValueExpressionType.OBJECT_REF;
  content?: unknown;
  rawMeta?: ValueExpressionRawMeta;
}

/**
 * 引用变量
 */
export interface RefExpression {
  type: ValueExpressionType.REF;
  content?: RefExpressionContent;
  /**
   * rawMeta 记录了该 ref expression 的类型
   * 可能和所引用变量类型不同，此时会触发类型自动转换: [Workflow 类型自动转换]()
   */
  rawMeta?: ValueExpressionRawMeta;
}

/**
 * 前端输入值表达式
 */
export type ValueExpression =
  | RefExpression
  | LiteralExpression
  | ObjectRefExpression;

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace ValueExpression {
  export function isRef(value: ValueExpression): value is RefExpression {
    return value.type === ValueExpressionType.REF;
  }
  export function isLiteral(
    value: ValueExpression,
  ): value is LiteralExpression {
    return value.type === ValueExpressionType.LITERAL;
  }
  export function isObjectRef(
    value: ValueExpression,
  ): value is ObjectRefExpression {
    return value?.type === ValueExpressionType.OBJECT_REF;
  }

  export function isExpression(value?: ValueExpression): boolean {
    if (isUndefined(value)) {
      return false;
    }
    return isRef(value) || isLiteral(value);
  }

  export function isEmpty(value: ValueExpression | undefined): boolean {
    if (value?.type === ValueExpressionType.OBJECT_REF) {
      return false;
    }

    if (value === null) {
      return true;
    }

    // 如果 value 不是对象或者函数，也就是原生类型，在插件自定义组件中会存在
    if (typeof value !== 'object' && typeof value !== 'function') {
      return isNil(value);
    }

    // value.content 有多种类型，可能是 false
    if (value?.content === '' || isNil(value?.content)) {
      return true;
    }
    if (Array.isArray(value?.content)) {
      return value?.content.length === 0;
    }

    if (value?.type === ValueExpressionType.REF) {
      return !(value?.content as RefExpressionContent)?.keyPath?.length;
    }

    return false;
  }
}

/**
 * 前端的value 输入值
 * {
 *     name: '',
 *     input: {
 *         type: ValueExpressionType.REF,
 *         content: {
 *             keyPath: ['nodeId', 'out3']
 *         }
 *
 *     }
 * }
 */
export interface InputValueVO {
  name?: string;
  input: ValueExpression;
  children?: InputValueVO[];
  key?: string;
}

export interface InputTypeValueVO {
  name: string;
  type: ViewVariableType;
  input: ValueExpression;
}

export enum BatchMode {
  Single = 'single',
  Batch = 'batch',
}

export interface BatchVOInputList {
  id: string;
  name: string;
  input: ValueExpression;
}

export interface BatchVO {
  batchSize: number;
  concurrentSize: number;
  inputLists: BatchVOInputList[];
}

export interface OutputValueVO {
  key: string;
  name: string;
  type: ViewVariableType;
  description?: string;
  readonly?: boolean;
  required?: boolean;
  children?: OutputValueVO[];
}
