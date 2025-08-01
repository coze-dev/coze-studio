/*
 * Copyright 2025 coze-dev Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
