import { WorkflowMode } from '@coze-arch/bot-api/workflow_api';

/**
 *
 * @param flowMode 是否广义上的 workflow，包含原来的 Workflow 和 Coze 2.0 新增的 Chatflow
 * @returns
 */
export const isGeneralWorkflow = (flowMode: WorkflowMode) =>
  flowMode === WorkflowMode.Workflow || flowMode === WorkflowMode.ChatFlow;
