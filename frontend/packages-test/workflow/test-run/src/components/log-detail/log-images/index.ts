import { type NodeResult } from '@coze-workflow/base';

/**
 * log images 业务逻辑太重了，本期暂不抽
 */
export type LogImages = React.FC<{
  testRunResult: NodeResult;
  nodeId?: string;
}>;
