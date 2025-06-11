import { type FeedbackStatus } from '@flowgram-adapter/free-layout-editor';
import { type WorkflowValidateError } from '@coze-workflow/base/services';
export type WorkflowProblem = WorkflowValidateError & {
  problems: {
    node: ProblemItem[];
    line: ProblemItem[];
  };
};

export interface ProblemItem {
  // 错误描述
  errorInfo: string;
  // 错误等级
  errorLevel: FeedbackStatus;
  // 错误类型： 节点 / 连线
  errorType: 'node' | 'line';
  // 节点id
  nodeId: string;
  // 若为连线错误，还需要目标节点来确认这条连线
  targetNodeId?: string;
}
