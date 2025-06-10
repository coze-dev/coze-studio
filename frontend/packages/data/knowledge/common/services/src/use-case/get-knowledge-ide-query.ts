interface KnowledgeIDEQuery {
  biz?: 'agentIDE' | 'workflow' | 'library' | 'project';
  bot_id?: string;
  workflow_id?: string;
  agent_id?: string;
  page_mode?: 'modal' | 'normal';
}
export const getKnowledgeIDEQuery = (): KnowledgeIDEQuery => {
  const queryParams = new URLSearchParams(location.search);
  const knowledgeQuery = {
    biz: queryParams.get('biz') as KnowledgeIDEQuery['biz'],
    bot_id: queryParams.get('bot_id'),
    workflow_id: queryParams.get('workflow_id'),
    agent_id: queryParams.get('agent_id'),
    page_mode: queryParams.get('page_mode') as KnowledgeIDEQuery['page_mode'],
  };
  // 过滤掉空值，避免产生多余的 querystring
  return Object.fromEntries(Object.entries(knowledgeQuery).filter(e => !!e[1]));
};
