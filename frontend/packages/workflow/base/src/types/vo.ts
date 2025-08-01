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
 * This file defines the data consumed by the front end and is represented by VO (view object)
 */
import { isNil, isUndefined } from 'lodash-es';

import type { ViewVariableType } from './view-variable-type';

export interface RefExpressionContent {
  /**
   * The reference value is the key path of a variable
   */
  keyPath: string[];
}

/**
 * value expression type
 */
export enum ValueExpressionType {
  LITERAL = 'literal',
  REF = 'ref',
  OBJECT_REF = 'object_ref',
}
/**
 * Used to store ValueExpression's original data source for front-end consumption
 */
export interface ValueExpressionRawMeta {
  type?: ViewVariableType;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

/**
 * Text expression
 */
export interface LiteralExpression {
  type: ValueExpressionType.LITERAL;
  content?: string | number | boolean | Array<unknown>;
  rawMeta?: ValueExpressionRawMeta;
}

/**
 * object expression
 */
export interface ObjectRefExpression {
  type: ValueExpressionType.OBJECT_REF;
  content?: unknown;
  rawMeta?: ValueExpressionRawMeta;
}

/**
 * reference variable
 */
export interface RefExpression {
  type: ValueExpressionType.REF;
  content?: RefExpressionContent;
  /**
   * rawMeta records the type of the ref expression
   * May be different from the referenced variable type, which triggers automatic type conversion: [Workflow type automatic conversion] ()
   */
  rawMeta?: ValueExpressionRawMeta;
}

/**
 * Front-end input value expression
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

    // If value is not an object or function, that is, a native type, it will exist in the plug-in custom component
    if (typeof value !== 'object' && typeof value !== 'function') {
      return isNil(value);
    }

    // Value.content has multiple types and may be false
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
 * Front end value input value
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
