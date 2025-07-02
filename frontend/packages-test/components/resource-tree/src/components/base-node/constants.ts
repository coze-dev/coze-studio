import { DependencyOrigin, NodeType } from '../../typings';

export const colorMap: Record<NodeType, string> = {
  [NodeType.WORKFLOW]: 'linear-gradient(#ebf9f0 0%, var(--coz-bg-plus) 100%)',
  [NodeType.CHAT_FLOW]: 'linear-gradient(#ebf9f0 0%, var(--coz-bg-plus) 100%)',
  [NodeType.PLUGIN]: 'linear-gradient(#fbf2ff 0%, var(--coz-bg-plus) 100%)',
  [NodeType.KNOWLEDGE]: 'linear-gradient(#fff5ed 0%, var(--coz-bg-plus) 100%)',
  [NodeType.DATABASE]: 'linear-gradient(#fef9eb 0%, var(--coz-bg-plus) 100%)',
};

export const contentMap = {
  [NodeType.WORKFLOW]: 'edit_block_api_workflow',
  [NodeType.CHAT_FLOW]: 'wf_chatflow_76',
  [NodeType.PLUGIN]: 'edit_block_api_plugin',
  [NodeType.KNOWLEDGE]: 'datasets_title',
  [NodeType.DATABASE]: 'bot_database',
};

export const getFromText = {
  [DependencyOrigin.APP]: '',
  [DependencyOrigin.LIBRARY]: 'workflow_version_origin_text',
  [DependencyOrigin.SHOP]: 'navigation_store',
};
