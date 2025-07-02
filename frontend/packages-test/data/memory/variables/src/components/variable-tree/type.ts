import { type CSSProperties } from 'react';

import { type Variable, type ViewVariableType } from '@/store';

import { type ChangeMode } from './components/custom-tree-node/constants';

export interface RecursedParamDefinition {
  name?: string;
  /** Tree 组件要求每一个节点都有 key，而 key 不适合用名称（前后缀）等任何方式赋值，最终确定由接口转换层一次性提供随机 key */
  fieldRandomKey?: string;
  desc?: string;
  type: ViewVariableType;
  children?: RecursedParamDefinition[];
}

export type TreeNodeCustomData = Variable;

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
  // 类型改变时内部的调用方法，主要用于从类Object类型转为其他类型时需要删除所有子项
  onSelectChange: (
    val?: string | number | Array<unknown> | Record<string, unknown>,
  ) => void;
}

export type WithCustomStyle<T = object> = {
  className?: string;
  style?: CSSProperties;
} & T;
