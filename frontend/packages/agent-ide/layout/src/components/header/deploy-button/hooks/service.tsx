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

import { useNavigate } from 'react-router-dom';

import { useShallow } from 'zustand/react/shallow';
import { useBotInfoStore } from '@coze-studio/bot-detail-store/bot-info';
import { getBotDetailIsReadonly } from '@coze-studio/bot-detail-store';
import { EVENT_NAMES, sendTeaEvent } from '@coze-arch/bot-tea';
import { type Type } from '@coze-arch/bot-semi/Button';

export interface DeployButtonProps {
  btnType?: Type;
  btnText?: string;
  customStyle?: Record<string, string>;
  readonly?: boolean;
  tooltip?: string;
}

export const useDeployService = () => {
  const navigate = useNavigate();

  const { botId, botInfo, spaceId } = useBotInfoStore(
    useShallow(s => ({
      description: s.description,
      botId: s.botId,
      botInfo: s,
      spaceId: s.space_id,
    })),
  );

  const handleDeploy = () => {
    if (!botId || getBotDetailIsReadonly()) {
      return;
    }

    navigate(`/space/${spaceId}/bot/${botId}/publish`);
  };

  const handlePublish = () => {
    sendTeaEvent(EVENT_NAMES.bot_publish_button_click, {
      bot_id: botId || '',
      bot_name: botInfo?.name || '',
    });

    handleDeploy();
  };

  return {
    handlePublish,
  } as const;
};
