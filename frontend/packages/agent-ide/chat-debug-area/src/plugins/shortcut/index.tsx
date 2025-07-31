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

import { useRef } from 'react';

import { useShallow } from 'zustand/react/shallow';
import { BotMode } from '@coze-arch/bot-api/playground_api';
import { useBotSkillStore } from '@coze-studio/bot-detail-store/bot-skill';
import { useBotInfoStore } from '@coze-studio/bot-detail-store/bot-info';
import { manuallySwitchAgent } from '@coze-studio/bot-detail-store';
import {
  ShortcutBar,
  getUIModeByBizScene,
  type ShortCutCommand,
} from '@coze-common/chat-area-plugins-chat-shortcuts';
import { useShowBackGround } from '@coze-common/chat-area/hooks/public/use-show-bgackground';
import { type ChatInputIntegrationController } from '@coze-common/chat-area';

import s from '../../index.module.less';

export const ShortcutBarRender = ({
  controller,
  onShortcutActive,
}: {
  controller: ChatInputIntegrationController;
  onShortcutActive?: (shortcut: ShortCutCommand | undefined) => void;
}) => (
  <ShortcutBarRenderImpl
    controller={controller}
    onShortcutActive={onShortcutActive}
  />
);

const ShortcutBarRenderImpl: React.FC<{
  controller: ChatInputIntegrationController;
  onShortcutActive?: (shortcut: ShortCutCommand | undefined) => void;
}> = ({ controller, onShortcutActive }) => {
  const activeShortcutRef = useRef<ShortCutCommand | undefined>(undefined);
  const showBackground = useShowBackGround();

  const { mode, botName, botUrl } = useBotInfoStore(
    useShallow(state => ({
      botUrl: state.icon_url,
      botName: state.name,
      mode: state.mode,
    })),
  );
  const { chatShortcuts } = useBotSkillStore(
    useShallow(state => ({
      chatShortcuts: state.shortcut,
    })),
  );

  const chatShortcutsWithBotInfo = chatShortcuts.shortcut_list?.map(
    shortcut => ({
      ...shortcut,
      bot_info: {
        icon_url: botUrl,
        name: botName,
      },
    }),
  );

  const singleModeShortcuts = chatShortcutsWithBotInfo?.filter(
    shortcut => !shortcut.agent_id,
  );

  const showShortcuts = {
    [BotMode.SingleMode]: singleModeShortcuts,
    [BotMode.WorkflowMode]: [],
    [BotMode.MultiMode]: chatShortcutsWithBotInfo,
  }[mode];

  const defaultId = showShortcuts?.at(0)?.command_id;

  if (mode === BotMode.WorkflowMode) {
    return null;
  }

  return (
    <ShortcutBar
      shortcuts={showShortcuts ?? []}
      defaultId={defaultId}
      wrapperClassName={s['coz-debug-shortcut-bar-wrapper']}
      uiMode={getUIModeByBizScene({
        bizScene: 'debug',
        showBackground,
      })}
      onActiveShortcutChange={(shortcutInfo, isTemplateShortcutActive) => {
        activeShortcutRef.current = shortcutInfo;
        // Hide text box & shortcut bar when opening template shortcut command
        const chatInputSlotVisible = !isTemplateShortcutActive;
        controller.setChatInputSlotVisible(chatInputSlotVisible);
        // Disable sending multimodal messages when template shortcuts are active
        onShortcutActive?.(shortcutInfo);
        // If an agent is specified, switch to the specified agent
        if (mode === BotMode.MultiMode) {
          shortcutInfo?.agent_id && manuallySwitchAgent(shortcutInfo.agent_id);
        }
      }}
    />
  );
};
