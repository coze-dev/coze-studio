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
import {
  AgentVersionCompat,
  BotMode,
} from '@coze-arch/bot-api/playground_api';

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
      // bot信息全量保存
      const { botSkillInfo } = getBotDetailDtoInfo();
      await updateBotRequest(botSkillInfo);

      // 服务端约定 切换模式需要单独调一次只传 bot_mode 的 update
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
