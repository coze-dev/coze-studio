import { useWorkflowNode } from '@coze-workflow/base';

/**
 * 获取数据库节点选中的数据库ID
 * @returns 返回当前数据库ID
 */
export function useCurrentDatabaseID() {
  const { data } = useWorkflowNode();
  const databaseList = data?.databaseInfoList ?? data?.inputs?.databaseInfoList;
  return databaseList?.[0]?.databaseInfoID;
}
