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

import React from 'react';

import { useShallow } from 'zustand/react/shallow';
import { useBotInfoStore } from '@coze-studio/bot-detail-store/bot-info';
import {
  autosaveManager,
  getBotDetailDtoInfo,
  initBotDetailStore,
  multiAgentSaveManager,
  updateBotRequest,
  updateHeaderStatus,
  useBotDetailIsReadonly,
} from '@coze-studio/bot-detail-store';
import { AgentVersionCompat, BotMode } from '@coze-arch/bot-api/playground_api';

import { useBotPageStore } from '../../store/bot-page/store';
import { ModeChangeView, type ModeChangeViewProps } from './mode-change-view';

export interface ModeSelectProps
  extends Pick<ModeChangeViewProps, 'optionList'> {
  readonly?: boolean;
  tooltip?: string;
}

export const ModeSelect: React.FC<ModeSelectProps> = ({
  readonly,
  tooltip,
  optionList,
}) => {
  const { mode } = useBotInfoStore(useShallow(store => ({ mode: store.mode })));

  const { modeSwitching, setBotState } = useBotPageStore(
    useShallow(state => ({
      modeSwitching: state.bot.modeSwitching,
      setBotState: state.setBotState,
    })),
  );

  const isReadonly = useBotDetailIsReadonly() || readonly;

  const handleModeChange = async (value: BotMode) => {
    try {
      setBotState({ modeSwitching: true });
      // The bot information is fully saved.
      const { botSkillInfo } = getBotDetailDtoInfo();
      await updateBotRequest(botSkillInfo);

      // Server level convention, switching mode needs to be adjusted once, only bot_mode update is transmitted.
      const switchModeParams = {
        bot_mode: value,
        ...(value === BotMode.MultiMode
          ? { version_compat: AgentVersionCompat.NewVersion }
          : {}),
      };
      const { data } = await updateBotRequest(switchModeParams);

      updateHeaderStatus(data);
      autosaveManager.close();
      multiAgentSaveManager.close();
      await initBotDetailStore();
      multiAgentSaveManager.start();
      autosaveManager.start();
    } finally {
      setBotState({ modeSwitching: false });
    }
  };
  return (
    <ModeChangeView
      modeSelectLoading={modeSwitching}
      modeValue={mode}
      onModeChange={handleModeChange}
      isReadOnly={isReadonly}
      tooltip={tooltip}
      optionList={optionList}
    />
  );
};
