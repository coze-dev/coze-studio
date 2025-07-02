import { type WorkflowModalState, WorkflowCategory } from './type';

/**
 * workflow modal 当前是否选中了 project 工具流分类
 * @param modalState
 */
export const isSelectProjectCategory = (modalState?: WorkflowModalState) =>
  modalState?.workflowCategory === WorkflowCategory.Project;
