import { type DiffDisplayNode } from '@coze-arch/bot-api/dp_manage_api';

export interface FlatDiffDisplayNode extends DiffDisplayNode {
  level?: number;
}
