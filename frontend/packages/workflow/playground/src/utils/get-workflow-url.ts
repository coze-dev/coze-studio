const workflowPath = 'work_flow';

/**
 * 获取 Workflow 页面 url
 * @param params 相关参数
 * @returns Workflow 页面 url
 */
export const getWorkflowUrl = (params: {
  space_id: string;
  workflow_id: string;
  version?: string;
}) => {
  const urlParams = new URLSearchParams(params);
  return `/${workflowPath}?${urlParams.toString()}`;
};
