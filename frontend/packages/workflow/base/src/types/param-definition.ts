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
 
import { type ViewVariableType } from './view-variable-type';

/**
 * 参数定义
 *
 * 递归定义，包含了复杂类型的层级结构
 */
export interface RecursedParamDefinition {
  name?: string;
  /** Tree 组件要求每一个节点都有 key，而 key 不适合用名称（前后缀）等任何方式赋值，最终确定由接口转换层一次性提供随机 key */
  fieldRandomKey?: string;
  desc?: string;
  required?: boolean;
  type: ViewVariableType;
  children?: RecursedParamDefinition[];
  // region 参数值定义
  // 输入参数的值可以来自上游变量引用，也可以是用户输入的定值（复杂类型则只允许引用）
  // 如果是定值，传 fixedValue
  // 如果是引用，传 quotedValue
  isQuote?: ParamValueType;
  /** 参数定值 */
  fixedValue?: string;
  /** 参数引用 */
  quotedValue?: [nodeId: string, ...path: string[]]; // string[]
  // endregion
}

export enum ParamValueType {
  QUOTE = 'quote',
  FIXED = 'fixed',
}
