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
  type FieldExtensionConfig,
  type ServiceExtensionConfig,
  type FunctionExtensionConfig,
} from '../common/extension_type';

export * from '../common/extension_type';

export interface ThriftError {
  type: ErrorType;
  message: string;
  loc: TextLocation;
}

export interface ParseError extends ThriftError {
  type: ErrorType.ParseError;
}

export interface ScanError extends ThriftError {
  type: ErrorType.ScanError;
}

export interface Node {
  type: SyntaxType;
}

export interface SyntaxNode extends Node {
  loc: TextLocation;
}

export interface StructLike {
  name: Identifier;
  fields: Array<FieldDefinition>;
  annotations?: Annotations;
  comments: Array<Comment>;
  loc: TextLocation;
}

export interface TextLocation {
  start: TextPosition;
  end: TextPosition;
}

export interface TextPosition {
  line: number;
  column: number;
  index: number;
}

export interface Token extends SyntaxNode {
  text: string;
}

export interface ThriftDocument extends Node {
  type: SyntaxType.ThriftDocument;
  body: Array<ThriftStatement>;
  tokens?: Array<Token>;
}

export interface ThriftErrors {
  type: SyntaxType.ThriftErrors;
  errors: Array<ThriftError>;
}

export type ThriftStatement =
  | NamespaceDefinition
  | IncludeDefinition
  | CppIncludeDefinition
  | ConstDefinition
  | StructDefinition
  | EnumDefinition
  | ExceptionDefinition
  | UnionDefinition
  | TypedefDefinition
  | ServiceDefinition;

export type CommentType = SyntaxType.CommentLine | SyntaxType.CommentBlock;

export type Comment = CommentLine | CommentBlock;

export interface CommentLine extends SyntaxNode {
  type: SyntaxType.CommentLine;
  value: string;
}

export interface CommentBlock extends SyntaxNode {
  type: SyntaxType.CommentBlock;
  value: Array<string>;
}

export interface Annotations extends SyntaxNode {
  annotations: Array<Annotation>;
}

export interface Annotation extends SyntaxNode {
  name: Identifier;
  value?: StringLiteral;
}

export interface PrimarySyntax extends SyntaxNode {
  comments: Array<Comment>;
}

export type FieldType = BaseType | ContainerType | Identifier;

export type FunctionType = FieldType | VoidType;

export type KeywordType =
  | SyntaxType.StringKeyword
  | SyntaxType.DoubleKeyword
  | SyntaxType.BoolKeyword
  | SyntaxType.I8Keyword
  | SyntaxType.I16Keyword
  | SyntaxType.I32Keyword
  | SyntaxType.I64Keyword
  | SyntaxType.BinaryKeyword
  | SyntaxType.ByteKeyword;

export interface VoidType extends SyntaxNode {
  type: SyntaxType.VoidKeyword;
}

export type ContainerType = SetType | MapType | ListType;

export interface BaseType extends SyntaxNode {
  type: KeywordType;
  annotations?: Annotations;
}

export interface SetType extends SyntaxNode {
  type: SyntaxType.SetType;
  valueType: FieldType;
  annotations?: Annotations;
}

export interface ListType extends SyntaxNode {
  type: SyntaxType.ListType;
  valueType: FieldType;
  annotations?: Annotations;
}

export interface MapType extends SyntaxNode {
  type: SyntaxType.MapType;
  keyType: FieldType;
  valueType: FieldType;
  annotations?: Annotations;
}

export type ConstValue =
  | StringLiteral
  | IntConstant
  | DoubleConstant
  | BooleanLiteral
  | ConstMap
  | ConstList
  | Identifier;

export interface NamespaceDefinition extends PrimarySyntax {
  type: SyntaxType.NamespaceDefinition;
  scope: Identifier;
  name: Identifier;
}

export interface ConstDefinition extends PrimarySyntax {
  type: SyntaxType.ConstDefinition;
  name: Identifier;
  fieldType: FieldType;
  initializer: ConstValue;
  annotations?: Annotations;
}

export type FieldRequired = 'required' | 'optional';

export interface IncludeDefinition extends PrimarySyntax {
  type: SyntaxType.IncludeDefinition;
  path: StringLiteral;
}

export interface CppIncludeDefinition extends PrimarySyntax {
  type: SyntaxType.CppIncludeDefinition;
  path: StringLiteral;
}

export interface InterfaceWithFields extends PrimarySyntax {
  name: Identifier;
  fields: Array<FieldDefinition>;
  annotations?: Annotations;
}

export interface StructDefinition extends InterfaceWithFields {
  type: SyntaxType.StructDefinition;
}

export interface UnionDefinition extends InterfaceWithFields {
  type: SyntaxType.UnionDefinition;
}

export interface ExceptionDefinition extends InterfaceWithFields {
  type: SyntaxType.ExceptionDefinition;
}

export interface FieldDefinition extends PrimarySyntax {
  type: SyntaxType.FieldDefinition;
  name: Identifier;
  fieldID: FieldID | null;
  fieldType: FunctionType;
  requiredness: FieldRequired | null;
  defaultValue: ConstValue | null;
  annotations?: Annotations;
  extensionConfig?: FieldExtensionConfig;
}

export interface FieldID extends SyntaxNode {
  type: SyntaxType.FieldID;
  value: number;
}

export interface EnumDefinition extends PrimarySyntax {
  type: SyntaxType.EnumDefinition;
  name: Identifier;
  members: Array<EnumMember>;
  annotations?: Annotations;
}

export interface EnumMember extends PrimarySyntax {
  type: SyntaxType.EnumMember;
  name: Identifier;
  initializer: IntConstant | null;
  annotations?: Annotations;
}

export interface TypedefDefinition extends PrimarySyntax {
  type: SyntaxType.TypedefDefinition;
  name: Identifier;
  definitionType: FieldType;
  annotations?: Annotations;
}

export interface ServiceDefinition extends PrimarySyntax {
  type: SyntaxType.ServiceDefinition;
  name: Identifier;
  extends: Identifier | null;
  functions: Array<FunctionDefinition>;
  annotations?: Annotations;
  extensionConfig?: ServiceExtensionConfig;
}

export interface FunctionDefinition extends PrimarySyntax {
  type: SyntaxType.FunctionDefinition;
  name: Identifier;
  oneway: boolean;
  returnType: FunctionType;
  fields: Array<FieldDefinition>;
  throws: Array<FieldDefinition>;
  modifiers: Array<Token>;
  annotations?: Annotations;
  extensionConfig?: FunctionExtensionConfig;
}

export interface ParametersDefinition extends SyntaxNode {
  type: SyntaxType.ParametersDefinition;
  fields: Array<FieldDefinition>;
}

export interface ThrowsDefinition extends SyntaxNode {
  type: SyntaxType.ThrowsDefinition;
  fields: Array<FieldDefinition>;
}

export interface StringLiteral extends SyntaxNode {
  type: SyntaxType.StringLiteral;
  value: string;
}

export interface BooleanLiteral extends SyntaxNode {
  type: SyntaxType.BooleanLiteral;
  value: boolean;
}

export interface IntegerLiteral extends SyntaxNode {
  type: SyntaxType.IntegerLiteral;
  value: string;
}

export interface HexLiteral extends SyntaxNode {
  type: SyntaxType.HexLiteral;
  value: string;
}

export interface FloatLiteral extends SyntaxNode {
  type: SyntaxType.FloatLiteral;
  value: string;
}

export interface ExponentialLiteral extends SyntaxNode {
  type: SyntaxType.ExponentialLiteral;
  value: string;
}

export interface IntConstant extends SyntaxNode {
  type: SyntaxType.IntConstant;
  value: IntegerLiteral | HexLiteral;
}

export interface DoubleConstant extends SyntaxNode {
  type: SyntaxType.DoubleConstant;
  value: FloatLiteral | ExponentialLiteral;
}

export interface ConstMap extends SyntaxNode {
  type: SyntaxType.ConstMap;
  properties: Array<PropertyAssignment>;
}

export interface ConstList extends SyntaxNode {
  type: SyntaxType.ConstList;
  elements: Array<ConstValue>;
}

export interface PropertyAssignment extends SyntaxNode {
  type: SyntaxType.PropertyAssignment;
  name: ConstValue;
  initializer: ConstValue;
}

export interface Identifier extends SyntaxNode {
  type: SyntaxType.Identifier;
  value: string;
  annotations?: Annotations;
}

export enum ErrorType {
  ParseError = 'ParseError',
  ScanError = 'ScanError',
}

export enum SyntaxType {
  ThriftDocument = 'ThriftDocument',
  ThriftErrors = 'ThriftErrors',

  Identifier = 'Identifier',
  FieldID = 'FieldID',

  // Statements
  NamespaceDefinition = 'NamespaceDefinition',
  IncludeDefinition = 'IncludeDefinition',
  CppIncludeDefinition = 'CppIncludeDefinition',
  ConstDefinition = 'ConstDefinition',
  StructDefinition = 'StructDefinition',
  EnumDefinition = 'EnumDefinition',
  ServiceDefinition = 'ServiceDefinition',
  ExceptionDefinition = 'ExceptionDefinition',
  TypedefDefinition = 'TypedefDefinition',
  UnionDefinition = 'UnionDefinition',

  // Fields
  FieldDefinition = 'FieldDefinition',
  FunctionDefinition = 'FunctionDefinition',
  ParametersDefinition = 'ParametersDefinition',
  ThrowsDefinition = 'ThrowsDefinition',

  // Type Annotations
  FieldType = 'FieldType',
  BaseType = 'BaseType',
  SetType = 'SetType',
  MapType = 'MapType',
  ListType = 'ListType',

  // Values
  ConstValue = 'ConstValue',
  IntConstant = 'IntConstant',
  DoubleConstant = 'DoubleConstant',

  ConstList = 'ConstList',
  ConstMap = 'ConstMap',
  EnumMember = 'EnumMember',

  // Literals
  CommentLine = 'CommentLine',
  CommentBlock = 'CommentBlock',
  StringLiteral = 'StringLiteral',
  IntegerLiteral = 'IntegerLiteral',
  FloatLiteral = 'FloatLiteral',
  HexLiteral = 'HexLiteral',
  ExponentialLiteral = 'ExponentialLiteral',
  BooleanLiteral = 'BooleanLiteral',
  PropertyAssignment = 'PropertyAssignment',

  // Tokens
  LeftParenToken = 'LeftParenToken',
  RightParenToken = 'RightParenToken',
  LeftBraceToken = 'LeftBraceToken',
  RightBraceToken = 'RightBraceToken',
  LeftBracketToken = 'LeftBracketToken',
  RightBracketToken = 'RightBracketToken',
  CommaToken = 'CommaToken',
  DotToken = 'DotToken',
  MinusToken = 'MinusToken',
  SemicolonToken = 'SemicolonToken',
  ColonToken = 'ColonToken',
  StarToken = 'StarToken',
  EqualToken = 'EqualToken',
  LessThanToken = 'LessThanToken',
  GreaterThanToken = 'GreaterThanToken',

  // Keywords
  NamespaceKeyword = 'NamespaceKeyword',
  IncludeKeyword = 'IncludeKeyword',
  CppIncludeKeyword = 'CppIncludeKeyword',
  ExceptionKeyword = 'ExceptionKeyword',
  ServiceKeyword = 'ServiceKeyword',
  ExtendsKeyword = 'ExtendsKeyword',
  RequiredKeyword = 'RequiredKeyword',
  OptionalKeyword = 'OptionalKeyword',
  FalseKeyword = 'FalseKeyword',
  TrueKeyword = 'TrueKeyword',
  ConstKeyword = 'ConstKeyword',
  DoubleKeyword = 'DoubleKeyword',
  StructKeyword = 'StructKeyword',
  TypedefKeyword = 'TypedefKeyword',
  UnionKeyword = 'UnionKeyword',
  StringKeyword = 'StringKeyword',
  BinaryKeyword = 'BinaryKeyword',
  BoolKeyword = 'BoolKeyword',
  ByteKeyword = 'ByteKeyword',
  EnumKeyword = 'EnumKeyword',
  SenumKeyword = 'SenumKeyword',
  ListKeyword = 'ListKeyword',
  SetKeyword = 'SetKeyword',
  MapKeyword = 'MapKeyword',
  I8Keyword = 'I8Keyword',
  I16Keyword = 'I16Keyword',
  I32Keyword = 'I32Keyword',
  I64Keyword = 'I64Keyword',
  ThrowsKeyword = 'ThrowsKeyword',
  VoidKeyword = 'VoidKeyword',
  OnewayKeyword = 'OnewayKeyword',

  // Other
  Annotation = 'Annotation',
  Annotations = 'Annotations',

  EOF = 'EOF',
}
