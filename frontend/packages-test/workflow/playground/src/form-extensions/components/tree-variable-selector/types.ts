import type { TreeNodeData } from '@coze-arch/bot-semi/Tree';

import { type VariableMetaWithNode } from '../../typings';

export type VariableTreeDataNode = VariableMetaWithNode & {
  label: string;
  value: string;
  isTop?: boolean;
  parent?: VariableTreeDataNode;
  disabled?: boolean;
  children?: Array<VariableTreeDataNode>;
};

export type RenderDisplayVarName = (params: {
  meta?: VariableMetaWithNode | null;
  path?: string[];
}) => string;

export type CustomFilterVar = (params: {
  meta?: VariableMetaWithNode | null;
  path?: string[];
}) => boolean;

export interface ITreeNodeData extends TreeNodeData {
  groupId?: string;
}

export enum SelectType {
  Option = 'option',
  Tree = 'tree',
}
