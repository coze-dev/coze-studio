import { type TreeNodeData } from '@coze-arch/bot-semi/Tree';
import { type InputType } from '@coze-arch/bot-api/playground_api';

export interface VarTreeNode extends TreeNodeData {
  varInputType?: InputType;
}
