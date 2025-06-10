import { getKnowledgeIDEQuery } from './get-knowledge-ide-query';

const isKnowledgePathname = (): boolean => {
  const knowledgePagePathReg = new RegExp('/space/[0-9]+/knowledge(/[0-9]+)*');
  return knowledgePagePathReg.test(location.pathname);
};
export const getKnowledgeIsFullModeByBiz = () => {
  if (!isKnowledgePathname()) {
    return false;
  }
  const { biz } = getKnowledgeIDEQuery();
  if (biz === 'agentIDE') {
    return true;
  }
  if (biz === 'workflow') {
    return true;
  }
  return false;
};
