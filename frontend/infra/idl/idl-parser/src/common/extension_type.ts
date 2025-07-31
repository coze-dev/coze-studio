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

export const POSITIONS = [
  'query',
  'body',
  'path',
  'header',
  'entire_body',
  'raw_body',
  'status_code',
];

export const SERIALIZERS = ['json', 'form', 'urlencoded'];

export const UPPERCASE_METHODS = [
  'GET',
  'POST',
  'PUT',
  'DELETE',
  'PATCH',
  'HEAD',
];

export const LOWERCASE_METHODS = [
  'get',
  'post',
  'put',
  'delete',
  'patch',
  'head',
];

export const SERVICE_EXTENSTION_CONFIG_KEYS = ['uri_prefix'];

export const FUNCTION_EXTENSTION_CONFIG_KEYS = [
  'serializer',
  'uri',
  'method',
  'group',
  'custom',
  'version',
  ...LOWERCASE_METHODS,
];

export const FIELD_EXTENSTION_CONFIG_KEYS = [
  'position',
  'key',
  'web_type',
  'value_type',
  'tag',
  ...POSITIONS,
];

export type Position =
  | 'query'
  | 'body'
  | 'path'
  | 'header'
  | 'entire_body'
  | 'raw_body'
  | 'status_code';

export type Serializer = 'json' | 'form' | 'urlencoded';

export type Method = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD';

export interface ServiceExtensionConfig {
  uri_prefix?: string;
}

export interface FunctionExtensionConfig {
  serializer?: Serializer;
  uri?: string;
  method?: Method;
  group?: string;
  custom?: string;
  // NOTE: used in bytedance
  version?: string;

  get?: string;
  post?: string;
  put?: string;
  delete?: string;
}

export interface FieldExtensionConfig {
  position?: Position;
  key?: string;
  web_type?: string;
  value_type?: string;

  query?: string;
  body?: string;
  path?: string;
  header?: string;
  entire_body?: string;
  raw_body?: string;
  status_code?: string;
  tag?: string;
}

export interface ExtensionConfig
  extends ServiceExtensionConfig,
    FunctionExtensionConfig,
    FieldExtensionConfig {}

export type ExtensionConfigStringKey = Exclude<
  keyof ExtensionConfig,
  'serializer' | 'method' | 'position'
>;
