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

import type { SchemaObject, JSONSchemaType } from 'ajv';
import { type Ctxs } from '@coze-arch/idl2ts-plugin';
import {
  type ProcessIdlCtx,
  type IParseEntryCtx,
  type IGenTemplateCtx,
  type FieldType,
  type FunctionType,
  type ConstValue,
  type FieldDefinition,
  type StructDefinition,
  type IParseResultItem,
  type ServiceDefinition,
  type FunctionDefinition,
  type IMeta,
} from '@coze-arch/idl2ts-helper';
import type * as t from '@babel/types';

export * from '@coze-arch/idl2ts-plugin';

export enum HOOK {
  PARSE_ENTRY = 'PARSE_ENTRY',
  GEN_FILE_AST = 'GEN_FILE_AST',
  PARSE_FUN_META = 'PARSE_FUN_META',
  PARSE_FUN_META_ITEM = 'PARSE_FUN_META_ITEM',
  PROCESS_IDL_AST = 'PROCESS_IDL_AST',
  PROCESS_IDL_NODE = 'PROCESS_IDL_NODE',
  GEN_FUN_TEMPLATE = 'GEN_FUN_TEMPLATE',
  GEN_MOCK_FILED = 'GEN_MOCK_FILED',
  WRITE_FILE = 'WRITE_FILE',
}

export type ListType = JSONSchemaType<any[]>;
export type StringType = JSONSchemaType<string>;
export type NumberType = JSONSchemaType<number>;
export type StructType = JSONSchemaType<{}>;
export interface EnumType {
  enum: number[];
}
export type BoolType = JSONSchemaType<boolean>;
export interface RefType {
  $ref: string;
}
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface AnyType {}
export interface ConstType {
  const: string | number;
}

export type AjvType =
  | ListType
  | StringType
  | NumberType
  | StructType
  | EnumType
  | RefType
  | BoolType
  | AnyType
  | ConstType;

export interface Schema extends SchemaObject {
  definitions: Record<string, AjvType>;
}

export interface ProcessIdlCtxWithSchema extends ProcessIdlCtx {
  schema: Schema;
}

export interface GenMockFieldCtx {
  fieldType: FieldType | FunctionType;
  defaultValue?: ConstValue;
  context?: {
    fieldDefinition: FieldDefinition;
    struct: StructDefinition;
    ast: IParseResultItem;
  };
  output?:
    | t.ObjectExpression
    | t.ArrayExpression
    | t.CallExpression
    | t.Identifier
    | t.StringLiteral
    | t.NumericLiteral
    | t.BooleanLiteral
    | t.MemberExpression;
}

export interface WriteFileCtx {
  ast: IParseResultItem[];
  content: string;
  filename: string;
}

export interface IProcessMetaItemCtx {
  meta: IMeta;
  ast: IParseResultItem;
  service: ServiceDefinition;
  method: FunctionDefinition;
}

export interface Contexts extends Ctxs {
  [HOOK.GEN_FILE_AST]: IParseEntryCtx;
  [HOOK.GEN_FUN_TEMPLATE]: IGenTemplateCtx;
  [HOOK.PARSE_ENTRY]: IParseEntryCtx;
  [HOOK.PARSE_FUN_META]: ProcessIdlCtx;
  [HOOK.PARSE_FUN_META_ITEM]: IProcessMetaItemCtx;
  [HOOK.PROCESS_IDL_AST]: ProcessIdlCtxWithSchema;
  [HOOK.PROCESS_IDL_NODE]: ProcessIdlCtxWithSchema;
  [HOOK.GEN_MOCK_FILED]: GenMockFieldCtx;
  [HOOK.WRITE_FILE]: WriteFileCtx;
}
