import { useShallow } from 'zustand/react/shallow';
import { type AgentSkillKey } from '@coze-agent-ide/tool-config';

import { useAbilityAreaContext } from '../../context/ability-area-context';

/**
 * @deprecated 内部使用，过渡期方案，针对非注册组件使用外部的skill设置
 */
export const useHasAgentSkillWithPK = () => {
  const {
    store: { useAgentAreaStore },
  } = useAbilityAreaContext();

  const { existManualAgentSkillKey, realSetHasAgentSkill } = useAgentAreaStore(
    state => ({
      existManualAgentSkillKey: state.existManualAgentSkillKey,
      realSetHasAgentSkill: state.setHasAgentSkillKey,
    }),
  );

  /**
   * @deprecated 内部使用，过渡期
   */
  const setHasAgentSkill = (
    agentSkillKey: AgentSkillKey,
    hasSkill: boolean,
  ) => {
    const isManual = existManualAgentSkillKey(agentSkillKey);

    if (!isManual) {
      realSetHasAgentSkill(agentSkillKey, hasSkill);
    }
  };

  return {
    setHasAgentSkill,
  };
};

export const useNoneAgentSkill = () => {
  const {
    store: { useAgentAreaStore },
  } = useAbilityAreaContext();

  const noneAgentSkill = useAgentAreaStore(
    useShallow(state =>
      state.registeredAgentSkillKeyList.every(
        agentSkillKey => !state.hasAgentSkillKeyList.includes(agentSkillKey),
      ),
    ),
  );

  return noneAgentSkill;
};
