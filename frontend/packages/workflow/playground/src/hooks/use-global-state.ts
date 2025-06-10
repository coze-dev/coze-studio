import { useConfigEntity } from '@flowgram-adapter/free-layout-editor';

import { WorkflowGlobalStateEntity } from '../entities';

/** 获取全局状态 */
export const useGlobalState = (
  listenChange = true,
): WorkflowGlobalStateEntity => {
  const globalState = useConfigEntity<WorkflowGlobalStateEntity>(
    WorkflowGlobalStateEntity,
    listenChange,
  );
  return globalState;
};
