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
     * Abnormal scene cover, view and server level data cannot match, need to trigger update server level data
     * There is data but hidden state
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
