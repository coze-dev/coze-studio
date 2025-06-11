import { type AgentSkillKey } from '@coze-agent-ide/tool-config';

import { useAbilityAreaContext } from '../../context/ability-area-context';

/**
 * 用于内部注册AgentSkill使用
 */
export const useRegisterAgentSkillKey = () => {
  const {
    store: { useAgentAreaStore },
  } = useAbilityAreaContext();

  const appendRegisteredAgentSkillKeyList = useAgentAreaStore(
    state => state.appendRegisteredAgentSkillKeyList,
  );

  return (agentSkillKey: AgentSkillKey) => {
    appendRegisteredAgentSkillKeyList(agentSkillKey);
  };
};
