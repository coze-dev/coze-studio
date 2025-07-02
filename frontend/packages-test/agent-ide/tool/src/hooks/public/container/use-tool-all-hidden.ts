import { useShallow } from 'zustand/react/shallow';
import { TOOL_KEY_TO_API_STATUS_KEY_MAP } from '@coze-agent-ide/tool-config';
import { usePageRuntimeStore } from '@coze-studio/bot-detail-store/page-runtime';
import { TabStatus } from '@coze-arch/bot-api/developer_api';

import { useRegisteredToolKeyConfigList } from '../../builtin/use-register-tool-key';
import { usePreference } from '../../../context/preference-context';

export const useIsAllToolHidden = () => {
  const { isReadonly } = usePreference();
  const botSkillBlockCollapsibleState = usePageRuntimeStore(
    useShallow(state => state.botSkillBlockCollapsibleState),
  );

  const registeredToolKeyConfigList = useRegisteredToolKeyConfigList();

  if (isReadonly) {
    return registeredToolKeyConfigList.every(
      toolConfig => !toolConfig.hasValidData,
    );
  }

  const statusKeyMap = registeredToolKeyConfigList.map(
    toolConfig => TOOL_KEY_TO_API_STATUS_KEY_MAP[toolConfig.toolKey],
  );

  return statusKeyMap.every(
    statusKey => botSkillBlockCollapsibleState[statusKey] === TabStatus.Hide,
  );
};
