import type { StandardNodeType, ViewVariableMeta } from '@coze-workflow/base';

export type VariableMetaWithNode = ViewVariableMeta & {
  nodeTitle?: string;
  nodeId?: string;
  nodeType?: StandardNodeType;
};
