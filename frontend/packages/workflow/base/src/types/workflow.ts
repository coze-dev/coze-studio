import {
  type Workflow,
  type WorkFlowDevStatus,
  type VCSCanvasData,
  type OperationInfo,
  type WorkFlowStatus,
} from '@coze-arch/bot-api/workflow_api';

export type WorkflowInfo = Omit<Workflow, 'status'> & {
  status?: WorkFlowDevStatus | WorkFlowStatus;
  vcsData?: VCSCanvasData;
  operationInfo?: OperationInfo;
};
