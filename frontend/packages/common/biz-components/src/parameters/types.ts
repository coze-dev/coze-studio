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
 
export enum ParamTypeAlias {
  String = 1,
  Integer,
  Boolean,
  Number,
  /** 理论上没有 List 了，此项仅作兼容 */
  List = 5,
  Object = 6,
  // 上面是 api 中定义的 InputType。下面是整合后的。从 99 开始，避免和后端定义撞车
  ArrayString = 99,
  ArrayInteger,
  ArrayBoolean,
  ArrayNumber,
  ArrayObject,
}

export const PARAM_TYPE_ALIAS_MAP: Record<ParamTypeAlias, string> = {
  [ParamTypeAlias.String]: 'String',
  [ParamTypeAlias.Integer]: 'Integer',
  [ParamTypeAlias.Boolean]: 'Boolean',
  [ParamTypeAlias.Number]: 'Number',
  [ParamTypeAlias.List]: 'List',
  [ParamTypeAlias.Object]: 'Object',
  [ParamTypeAlias.ArrayString]: 'Array<String>',
  [ParamTypeAlias.ArrayInteger]: 'Array<Integer>',
  [ParamTypeAlias.ArrayBoolean]: 'Array<Boolean>',
  [ParamTypeAlias.ArrayNumber]: 'Array<Number>',
  [ParamTypeAlias.ArrayObject]: 'Array<Object>',
};

export enum ParamValueType {
  QUOTE = 'quote',
  FIXED = 'fixed',
}

export interface RecursedParamDefinition {
  name?: string;
  /** Tree 组件要求每一个节点都有 key，而 key 不适合用名称（前后缀）等任何方式赋值，最终确定由接口转换层一次性提供随机 key */
  fieldRandomKey?: string;
  desc?: string;
  required?: boolean;
  type: ParamTypeAlias;
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

export interface ParameterValue {
  key: string;
  name?: string;
  type: ParamTypeAlias;
  description?: string;
  children?: ParameterValue[];
}

export interface ParametersError {
  path: string;
  message: string;
}

export interface ParametersProps {
  value: Array<ParameterValue>;
  onChange?: (value: Array<ParameterValue>) => void;
  readonly?: boolean;
  className?: string;
  style?: React.CSSProperties;
  withDescription?: boolean;
  // 不支持使用的类型
  disabledTypes?: ParamTypeAlias[];
  errors?: ParametersError[];
  // 支持空值 & 空数组
  allowValueEmpty?: boolean;
}
