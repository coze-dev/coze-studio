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
