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

export type KeywordType =
  | 'double'
  | 'float'
  | 'int32'
  | 'int64'
  | 'uint32'
  | 'uint64'
  | 'sint32'
  | 'sint64'
  | 'fixed32'
  | 'fixed64'
  | 'sfixed32'
  | 'sfixed64'
  | 'bool'
  | 'string'
  | 'bytes';

export type FieldRule = 'repeated' | 'required';

export interface BaseType {
  syntaxType: SyntaxType.BaseType;
  value: KeywordType;
}

export interface Identifier {
  syntaxType: SyntaxType.Identifier;
  value: string;
  resolvedValue?: string;
}

export type FieldType = BaseType | Identifier;

export interface ReflectionObject {
  name: string;
  fullName?: string;
  options?: Record<string, string>;
  comment?: string;
}

export interface FieldDefinition extends ReflectionObject {
  syntaxType: SyntaxType.FieldDefinition;
  id: number;
  type: FieldType;
  rule?: FieldRule;
  optional: boolean;
  required: boolean;
  repeated: boolean;
  map: boolean;
  extend?: string;
  keyType?: FieldType;
  extensionConfig?: FieldExtensionConfig;
}

export interface OneofDefinition extends ReflectionObject {
  syntaxType: SyntaxType.OneofDefinition;
  oneof: string[];
}

export interface MethodDefinition extends ReflectionObject {
  syntaxType: SyntaxType.MethodDefinition;
  requestType: FieldType;
  responseType: FieldType;
  extensionConfig?: FunctionExtensionConfig;
}

export interface NamespaceBase extends ReflectionObject {
  syntaxType: SyntaxType;
  nested?: Record<string, NamespaceBase>;
}

export interface NamespaceDefinition extends NamespaceBase {
  syntaxType: SyntaxType.NamespaceDefinition;
}

export interface MessageDefinition extends NamespaceBase {
  syntaxType: SyntaxType.MessageDefinition;
  fields: Record<string, FieldDefinition>;
  oneofs: Record<string, OneofDefinition>;
  extensions?: string[];
  reserved?: number[] | string;
}

export interface EnumDefinition extends NamespaceBase {
  syntaxType: SyntaxType.EnumDefinition;
  values: Record<string, number>;
  reserved?: number[] | string;
}

export interface ServiceDefinition extends NamespaceBase {
  syntaxType: SyntaxType.ServiceDefinition;
  methods: Record<string, MethodDefinition>;
  extensionConfig?: ServiceExtensionConfig;
}

export interface ProtoRoot extends NamespaceBase {
  syntaxType: SyntaxType.ProtoRoot;
}

export interface ProtoDocument {
  syntaxType: SyntaxType.ProtoDocument;
  imports?: string[];
  weakImports?: string[];
  package?: string;
  syntax: 'proto2' | 'proto3';
  root: ProtoRoot;
}

export interface ProtoError {
  syntaxType: SyntaxType.ProtoError;
  line: number;
  message: string;
  error: Error;
}

export enum SyntaxType {
  BaseType = 'BaseType',
  Identifier = 'Identifier',
  OneofDefinition = 'OneofDefinition',
  FieldDefinition = 'FieldDefinition',
  MethodDefinition = 'MethodDefinition',

  NamespaceDefinition = 'NamespaceDefinition',
  MessageDefinition = 'MessageDefinition',
  EnumDefinition = 'EnumDefinition',
  ServiceDefinition = 'ServiceDefinition',

  ProtoRoot = 'ProtoRoot',
  ProtoDocument = 'ProtoDocument',
  ProtoError = 'ProtoError',
}
