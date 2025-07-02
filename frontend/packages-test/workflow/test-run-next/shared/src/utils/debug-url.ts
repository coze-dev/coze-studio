interface DebugUrlParams {
  spaceId: string;
  workflowId: string;
  executeId: string;
  nodeId?: string;
  subExecuteId?: string;
}

/**
 * 计算 DebugUrl
 */
const getDebugUrl = (params: DebugUrlParams) => {
  const { spaceId, workflowId, executeId, subExecuteId, nodeId } = params;
  const search = new URLSearchParams({
    space_id: spaceId,
    workflow_id: workflowId,
    execute_id: executeId,
    node_id: nodeId || '',
    sub_execute_id: subExecuteId || '',
  });
  return `/work_flow?${search.toString()}`;
};

export const gotoDebugFlow = (params: DebugUrlParams, op?: boolean) => {
  if (op) {
    const { workflowId, executeId, subExecuteId, nodeId } = params;
    const search = new URLSearchParams({
      workflow_id: workflowId,
      execute_id: executeId,
      node_id: nodeId || '',
      sub_execute_id: subExecuteId || '',
    });
    window.open(`${window.location.pathname}?${search.toString()}`);
  }
  const url = getDebugUrl(params);
  window.open(url);
};
