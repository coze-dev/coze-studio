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
 
import { type RecursedParamDefinition } from '@coze-workflow/base';
import { type TreeNodeData } from '@coze-arch/bot-semi/Tree';

import { type LiteralValueType } from '@/form-extensions/components/literal-value-input';

import { type ChangeMode } from './constants';

export type DefaultValueType = LiteralValueType;

export type TreeNodeCustomData = TreeNodeData &
  Pick<
    RecursedParamDefinition,
    | 'name'
    | 'type'
    | 'isQuote'
    | 'fixedValue'
    | 'quotedValue'
    | 'fieldRandomKey'
  > & {
    // 行唯一值
    key: string;
    // Form的field
    field: string;
    // 是否是第一项
    isFirst: boolean;
    // 是否是最后一项
    isLast: boolean;
    // 是否只有该项一条数据
    isSingle: boolean;
    // 该项的嵌套层级，从0开始
    level: number;
    // 辅助线展示的字段
    helpLineShow: Array<boolean>;
    children?: Array<TreeNodeCustomData>;
    // 变量描述，用于作为隐藏的引导
    description?: string;
    // 是否必选
    required?: boolean;
    // 标识该条参数是内置参数，默认为 false
    isPreset?: boolean;
    // 标识该条参数是否启用，默认为 false
    enabled?: boolean;
    // 默认值
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    defaultValue?: any;
  };

export interface CustomTreeNodeFuncRef {
  data: TreeNodeCustomData;
  level: number;
  readonly: boolean;
  // 通用change方法
  onChange: (mode: ChangeMode, param: TreeNodeCustomData) => void;
  // 定制的类型改变的change方法，主要用于自定义render使用
  // 添加子项
  onAppend: () => void;
  // 删除该项
  onDelete: () => void;
  // 删除该项下面的所有子项
  onDeleteChildren: () => void;
  // 类型改变时内部的调用方法，主要用于从类Object类型转为其他类型时需要删除所有子项
  onSelectChange: (
    val?: string | number | Array<unknown> | Record<string, unknown>,
  ) => void;
}

export interface ActiveMultiInfo {
  // 当前行是否处于多行状态，多行状态竖线需要延长
  activeMultiKey: string;
  // 当前行paramName数据是否出现错误信息
  withNameError?: boolean;
}
