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
 
import type { Validate } from '@flowgram-adapter/free-layout-editor';

export type FormSchemaTypes =
  | 'string'
  | 'object'
  | 'array'
  | 'number'
  | 'boolean'
  | 'void'
  | string;

export type IFormSchemaValidate = Validate;

export interface FormSchemaUIState {
  disabled: boolean;
}

export interface IFormSchema<FrameworkComponent = React.ReactNode> {
  /*******************************************************
   * 核心属性
   */
  version?: string;
  name?: string;
  type?: FormSchemaTypes;
  /** 默认值，“default” 是 jsonSchema 标准字段，但其为 js 关键字，遂使用 defaultValue */
  defaultValue?: any;

  /*******************************************************
   * 下钻属性
   */
  properties?: Record<string, IFormSchema<FrameworkComponent>>;
  items?: IFormSchema<FrameworkComponent>[];

  /*******************************************************
   * ui 属性
   */
  title?: FrameworkComponent | string;
  description?: FrameworkComponent | string;
  /** 顺序 */
  ['x-index']?: number;
  ['x-visible']?: boolean;
  ['x-hidden']?: boolean;
  ['x-disabled']?: boolean;
  /** 渲染的组件 */
  ['x-component']?: string;
  ['x-component-props']?: Record<string, unknown>;
  /** 装饰器 */
  ['x-decorator']?: string;
  ['x-decorator-props']?: Record<string, unknown>;

  /*******************************************************
   * 合法性属性
   */
  required?: boolean;
  ['x-validator']?: IFormSchemaValidate;

  /*******************************************************
   * 不常用或实现成本较高
   */
  ['x-reactions']?: any;
  ['x-content']?: FrameworkComponent;
  /** 通配符字段 */
  patternProperties?: Record<string, IFormSchema<FrameworkComponent>>;
  /** 定义之外的字段 */
  additionalProperties?: IFormSchema<FrameworkComponent>;
  /** 定义之外的项 */
  additionalItems?: IFormSchema<FrameworkComponent>;

  /*******************************************************
   * 业务自定义字段
   */
  /** 节点 id */
  ['x-node-id']?: string;
  /** 节点类型 */
  ['x-node-type']?: string;
  /** 表单模式 */
  ['x-form-mode']?: 'form' | 'json';
  /** 字段对应变量原始类型 */
  ['x-origin-type']?: string;
  [key: string]: any;
}
