import type { TreeNodeData } from '@coze-arch/bot-semi/Tree';

import { type ViewVariableType as VariableType } from '../variable-types';
import type { ExpressionEditorSegmentType } from './constant';

export type ExpressionEditorSegment<
  T extends ExpressionEditorSegmentType = ExpressionEditorSegmentType,
> = {
  [ExpressionEditorSegmentType.ObjectKey]: {
    type: ExpressionEditorSegmentType.ObjectKey;
    index: number;
    objectKey: string;
  };
  [ExpressionEditorSegmentType.ArrayIndex]: {
    type: ExpressionEditorSegmentType.ArrayIndex;
    index: number;
    arrayIndex: number;
  };
  [ExpressionEditorSegmentType.EndEmpty]: {
    type: ExpressionEditorSegmentType.EndEmpty;
    index: number;
  };
}[T];

export interface Variable {
  key: string;
  type: VariableType;
  name: string;
  children?: Variable[];
  // 用户自定义节点名展示
  label?: string;
}

export interface ExpressionEditorTreeNode extends TreeNodeData {
  label: string;
  value: string;
  key: string;
  keyPath?: string[];
  variable?: Variable;
  children?: ExpressionEditorTreeNode[];
  parent?: ExpressionEditorTreeNode;
}

export interface ExpressionEditorParseData {
  content: {
    line: string;
    inline: string;
    reachable: string;
    unreachable: string;
  };
  offset: {
    line: number;
    inline: number;
    lastStart: number;
    firstEnd: number;
  };
  segments: {
    inline?: ExpressionEditorSegment[];
    reachable: ExpressionEditorSegment[];
  };
}
