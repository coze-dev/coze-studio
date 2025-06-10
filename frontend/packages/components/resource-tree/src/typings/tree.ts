import { type FlowNodeMeta } from '@flowgram-adapter/fixed-layout-editor';

export interface TreeNode {
  id: string;
  type: string;
  meta?: FlowNodeMeta;
  // collapsed、depth 放在 data 中
  data: Record<string, any>;
  parent: TreeNode[];
  children?: TreeNode[];
}
