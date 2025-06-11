import { useShallow } from 'zustand/react/shallow';
import { type AgentSkillKey } from '@coze-agent-ide/tool-config';

import { useAbilityAreaContext } from '../../../context/ability-area-context';

export const useHasAgentSkill = () => {
  const {
    store: { useAgentAreaStore },
  } = useAbilityAreaContext();
  const {
    setHasAgentSkillKey,
    existHasAgentSkillKey,
    appendManualAgentSkillKeyList,
  } = useAgentAreaStore(
    useShallow(state => ({
      setHasAgentSkillKey: state.setHasAgentSkillKey,
      existHasAgentSkillKey: state.existHasAgentSkillKey,
      appendManualAgentSkillKeyList: state.appendManualAgentSkillKeyList,
    })),
  );

  const setHasAgentSkill = (
    agentSkillKey: AgentSkillKey,
    hasSkill: boolean,
  ) => {
    setHasAgentSkillKey(agentSkillKey, hasSkill);
    appendManualAgentSkillKeyList(agentSkillKey);
  };

  const getHasAgentSkill = (agentSkillKey: AgentSkillKey) =>
    existHasAgentSkillKey(agentSkillKey);

  return {
    setHasAgentSkill,
    getHasAgentSkill,
  };
};
