import { type ReactNode } from 'react';

import classNames from 'classnames';
import {
  useLatestSectionId,
  useMessageBoxContext,
} from '@coze-common/chat-area';
import { I18n } from '@coze-arch/i18n';
import { Button } from '@coze/coze-design';
import { TriggerEnabled } from '@coze-arch/bot-api/developer_api';

import { getShowBotTriggerButton } from '../../utils/get-show-bot-trigger-button';
import { useUpdateHomeTriggerConfig } from '../../hooks/use-update-home-trigger-config';
import { useGetBotParticipantInfo } from '../../hooks/use-get-bot-participant-info';
import { useAnswerActionStore } from '../../context/store';
import { useAnswerActionPreference } from '../../context/preference';

import styles from './index.module.less';

export interface BotTriggerConfigButtonGroupProps {
  addonBefore?: ReactNode;
}

export const BotTriggerConfigButtonGroup: React.FC<
  BotTriggerConfigButtonGroupProps
> = ({ addonBefore }) => {
  const { message, meta } = useMessageBoxContext();

  const { sender_id } = message;

  const { useFavoriteBotTriggerConfigStore } = useAnswerActionStore();

  const botParticipantInfo = useFavoriteBotTriggerConfigStore(
    state => state.favoriteBotTriggerConfigMap[sender_id ?? ''],
  );

  const latestSectionId = useLatestSectionId();

  const isShowTriggerButton = getShowBotTriggerButton({
    message,
    meta,
    latestSectionId,
  });

  const { enableBotTriggerControl } = useAnswerActionPreference();

  useGetBotParticipantInfo({
    botId: sender_id,
    isEnabled:
      isShowTriggerButton && !botParticipantInfo && enableBotTriggerControl,
  });

  const { keepReceiveHomeTrigger, stopReceiveHomeTrigger, loading } =
    useUpdateHomeTriggerConfig({
      botId: sender_id,
      onSuccess: isKeepReceiveTrigger => {
        if (!sender_id) {
          return;
        }
        const { updateFavoriteBotTriggerConfigMapByImmer } =
          useFavoriteBotTriggerConfigStore.getState();
        updateFavoriteBotTriggerConfigMapByImmer(draft => {
          const targetConfig = draft[sender_id];
          if (!targetConfig) {
            return;
          }
          targetConfig.trigger_enabled = isKeepReceiveTrigger
            ? TriggerEnabled.Open
            : TriggerEnabled.Close;
        });
      },
    });

  if (!isShowTriggerButton) {
    return null;
  }

  if (!botParticipantInfo) {
    return null;
  }

  const { is_store_favorite, trigger_enabled } = botParticipantInfo;

  if (!enableBotTriggerControl) {
    return null;
  }

  if (!is_store_favorite || trigger_enabled !== TriggerEnabled.Init) {
    return null;
  }

  return (
    <div
      className={classNames(
        styles['slide-in'],
        'flex gap-x-[8px] items-center',
      )}
    >
      {addonBefore}
      <div className="flex gap-x-[6px] items-center">
        <Button
          color="highlight"
          onClick={stopReceiveHomeTrigger}
          loading={loading}
          size="small"
        >
          {I18n.t('stop_receiving')}
        </Button>
        <Button
          color="brand"
          onClick={keepReceiveHomeTrigger}
          loading={loading}
          size="small"
        >
          {I18n.t('keep')}
        </Button>
      </div>
    </div>
  );
};
