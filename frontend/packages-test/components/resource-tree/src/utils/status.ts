import { type DependencyTree } from '@coze-arch/bot-api/workflow_api';

export const isDepEmpty = (data?: DependencyTree) => {
  if (!data) {
    return true;
  }
  if (data.edge_list?.length) {
    return false;
  }
  const rootNode = data.node_list?.[0]?.dependency || {};
  const hasKnowledge = rootNode.knowledge_list?.length;
  const hasPlugins = rootNode.plugin_version?.length;
  const hasTable = rootNode.table_list?.length;
  const hasSubWorkflow = rootNode.workflow_version?.length;
  return !hasKnowledge && !hasPlugins && !hasTable && !hasSubWorkflow;
};
