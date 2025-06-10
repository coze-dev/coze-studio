import { TOOL_KEY_TO_API_STATUS_KEY_MAP } from '@coze-agent-ide/tool-config';
import { usePageRuntimeStore } from '@coze-studio/bot-detail-store/page-runtime';
import { TabStatus } from '@coze-arch/bot-api/developer_api';

import { useAbilityConfig } from '../../builtin/use-ability-config';
import { isToolKey } from '../../../utils/is-tool-key';
import { usePreference } from '../../../context/preference-context';
import { useAbilityAreaContext } from '../../../context/ability-area-context';

export const useToolValidData = () => {
  const {
    store: { useToolAreaStore },
  } = useAbilityAreaContext();

  const setToolHasValidData = useToolAreaStore(
    state => state.setToolHasValidData,
  );

  const setBotSkillBlockCollapsibleState = usePageRuntimeStore(
    state => state.setBotSkillBlockCollapsibleState,
  );

  const { abilityKey, scope } = useAbilityConfig();

  const toolStatus = usePageRuntimeStore(state =>
    abilityKey
      ? state.botSkillBlockCollapsibleState[
          TOOL_KEY_TO_API_STATUS_KEY_MAP[abilityKey]
        ]
      : null,
  );

  const { isReadonly } = usePreference();

  return (hasValidData: boolean) => {
    if (!isToolKey(abilityKey, scope)) {
      return;
    }

    setToolHasValidData({
      toolKey: abilityKey,
      hasValidData,
    });

    /**
     * 异常场景兜底，视图和服务端数据无法匹配，需要触发更新服务端数据
     * 有数据但是隐藏状态
     */
    if (toolStatus === TabStatus.Hide && hasValidData) {
      setBotSkillBlockCollapsibleState(
        {
          [TOOL_KEY_TO_API_STATUS_KEY_MAP[abilityKey]]: TabStatus.Default,
        },
        isReadonly,
      );
    }
  };
};
