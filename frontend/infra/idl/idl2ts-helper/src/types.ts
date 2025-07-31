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
  type UnifyStatement,
  SyntaxType,
  type StructDefinition,
  type FieldType,
  type Identifier,
  type BaseType,
  type MapType,
  type TypedefDefinition,
  type EnumDefinition,
  type ServiceDefinition,
  type FunctionType,
  type ConstDefinition,
  type SyntaxNode,
  type SetType,
  type ListType,
  type IntegerLiteral,
  type HexLiteral,
  type IntConstant,
  type StringLiteral,
  type DoubleConstant,
  type BooleanLiteral,
  type ConstMap,
  type ConstList,
  type ConstValue,
  type Annotations,
  type UnifyDocument,
} from '@coze-arch/idl-parser';

export * from '@coze-arch/idl-parser';

export interface Deps {
  [path: string]: IParseResultItem;
}

export type IParseResultItem = UnifyDocument & {
  idlPath: string;
  includeMap: Record<string, string>;
  deps: Deps;
  isEntry: boolean;
};

export interface I64Type extends BaseType {
  type: SyntaxType.I64Keyword;
  annotations?: Annotations;
}

export interface I32Type extends BaseType {
  type: SyntaxType.I32Keyword;
  annotations?: Annotations;
}

export interface I16Type extends BaseType {
  type: SyntaxType.I16Keyword;
  annotations?: Annotations;
}
export interface I8Type extends BaseType {
  type: SyntaxType.I8Keyword;
  annotations?: Annotations;
}

export interface StringType extends BaseType {
  type: SyntaxType.StringKeyword;
  annotations?: Annotations;
}

export type RefType =
  | ConstDefinition
  | StructDefinition
  | EnumDefinition
  | TypedefDefinition
  | ServiceDefinition;

export function isServiceDefinition(
  statement: UnifyStatement,
): statement is ServiceDefinition {
  return statement.type === SyntaxType.ServiceDefinition;
}
export function isStructDefinition(
  statement: UnifyStatement,
): statement is StructDefinition {
  return statement.type === SyntaxType.StructDefinition;
}

export function isTypedefDefinition(
  statement: UnifyStatement,
): statement is TypedefDefinition {
  return statement.type === SyntaxType.TypedefDefinition;
}
export function isEnumDefinition(
  statement: UnifyStatement,
): statement is EnumDefinition {
  return statement.type === SyntaxType.EnumDefinition;
}
export function isConstDefinition(
  statement: UnifyStatement,
): statement is ConstDefinition {
  return statement.type === SyntaxType.ConstDefinition;
}
export function isIdentifier(
  statement: FieldType | FunctionType | ConstValue,
): statement is Identifier {
  return statement.type === SyntaxType.Identifier;
}

export function findDefinition(
  statements: UnifyStatement[],
  structName: string,
): UnifyStatement | undefined {
  for (const statement in statements) {
    // eslint-disable-next-line no-prototype-builtins
    if (statements.hasOwnProperty(statement)) {
      const element = statements[statement];
      if (element.name.value === structName) {
        return element;
      }
    }
  }
  return undefined;
}
/**
 * isBasetype
 */
export function isBaseType(
  fieldType: FieldType | FunctionType,
): fieldType is BaseType {
  const BaseType = [
    SyntaxType.StringKeyword,
    SyntaxType.DoubleKeyword,
    SyntaxType.BoolKeyword,
    SyntaxType.I8Keyword,
    SyntaxType.I16Keyword,
    SyntaxType.I32Keyword,
    SyntaxType.I64Keyword,
    SyntaxType.BinaryKeyword,
    SyntaxType.ByteKeyword,
  ];
  return BaseType.indexOf(fieldType.type) > -1;
}

export function isI64Type(
  fieldType: FieldType | FunctionType,
): fieldType is I64Type {
  return fieldType.type === SyntaxType.I64Keyword;
}

// export function isI64Type(fieldType: FieldType | FunctionType): fieldType is BaseType {

// }

/**
 * isReftype
 */
export function isReftype(statement: UnifyStatement): statement is RefType {
  const BaseType = [
    SyntaxType.ConstDefinition,
    SyntaxType.StructDefinition,
    SyntaxType.EnumDefinition,
    // SyntaxType.UnionDefinition,
    SyntaxType.TypedefDefinition,
    SyntaxType.ServiceDefinition,
  ];
  return BaseType.indexOf(statement.type) > -1;
}
export function isMapType(
  fieldType: FieldType | FunctionType,
): fieldType is MapType {
  return fieldType.type === SyntaxType.MapType;
}
export function isSetType(
  fieldType: FieldType | FunctionType,
): fieldType is SetType {
  return fieldType.type === SyntaxType.SetType;
}
export function isListType(
  fieldType: FieldType | FunctionType,
): fieldType is ListType {
  return fieldType.type === SyntaxType.ListType;
}
export function isIntegerLiteral(
  fieldType: SyntaxNode,
): fieldType is IntegerLiteral {
  return fieldType.type === SyntaxType.IntegerLiteral;
}

export function isHexLiteral(fieldType: SyntaxNode): fieldType is HexLiteral {
  return fieldType.type === SyntaxType.HexLiteral;
}

export function isStringLiteral(
  fieldType: SyntaxNode,
): fieldType is StringLiteral {
  return fieldType.type === SyntaxType.StringLiteral;
}
export function isAnnotations(fieldType: any): fieldType is Annotations {
  return fieldType.type === SyntaxType.Annotations;
}
export function isIntConstant(fieldType: SyntaxNode): fieldType is IntConstant {
  return fieldType.type === SyntaxType.IntConstant;
}
export function isDoubleConstant(
  fieldType: SyntaxNode,
): fieldType is DoubleConstant {
  return fieldType.type === SyntaxType.DoubleConstant;
}
export function isBooleanLiteral(
  fieldType: SyntaxNode,
): fieldType is BooleanLiteral {
  return fieldType.type === SyntaxType.BooleanLiteral;
}
export function isConstMap(fieldType: SyntaxNode): fieldType is ConstMap {
  return fieldType.type === SyntaxType.ConstMap;
}
export function isConstList(fieldType: SyntaxNode): fieldType is ConstList {
  return fieldType.type === SyntaxType.ConstList;
}
