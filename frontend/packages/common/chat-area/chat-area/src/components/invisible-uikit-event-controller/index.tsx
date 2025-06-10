import { useEffect, type FC } from 'react';

import {
  ReportMessageAction,
  type SendMessageOptions,
} from '@coze-common/chat-core';
import { type SendTextMessagePayload } from '@coze-common/chat-uikit-shared';

import { EventNames } from '../../utils/event-bus/uikit-event-bus';
import { type Message } from '../../store/types';
import {
  useResendMessage,
  useSendTextMessage,
} from '../../hooks/messages/use-send-message';
import { useGetScrollView } from '../../hooks/context/use-get-scroll-view';
import { useChatCore } from '../../hooks/context/use-chat-core';
import { useChatAreaContext } from '../../hooks/context/use-chat-area-context';
import { type SendMessageFrom } from '../../context/chat-area-context/chat-area-callback';

type IProps = Record<string, unknown>;

export const InvisibleUIKitEventController: FC<IProps> = () => {
  const resendMessage = useResendMessage();
  const sendTextMessage = useSendTextMessage();
  const chatCore = useChatCore();
  const { eventCenter } = useChatAreaContext();
  const getScrollView = useGetScrollView();
  const handleResendMessage = ({ message }: { message: Message }) => {
    resendMessage(message);
  };

  const handleSendTextMessage = (
    payload: SendTextMessagePayload & {
      clickLocation: SendMessageFrom;
      options?: SendMessageOptions;
    },
  ) => {
    const { clickLocation, text, mentionList, options } = payload;

    sendTextMessage({ text, mentionList }, clickLocation, options);
    getScrollView().scrollToPercentage(1);
  };

  const handleUpdateCardStatus = async ({
    messageID,
    action,
  }: {
    messageID: string;
    action: string;
  }) => {
    await chatCore.reportMessage({
      message_id: messageID,
      action: ReportMessageAction.UpdataCard,
      attributes: {
        card_status: { state: action },
      },
    });
  };

  useEffect(() => {
    eventCenter.on(EventNames.RESEND_MESSAGE, handleResendMessage);
    eventCenter.on(EventNames.SEND_TEXT_MESSAGE, handleSendTextMessage);
    eventCenter.on(EventNames.UPDATE_CARD_STATUS, handleUpdateCardStatus);
    return () => {
      eventCenter.off(EventNames.RESEND_MESSAGE);
      eventCenter.off(EventNames.SEND_TEXT_MESSAGE);
      eventCenter.off(EventNames.UPDATE_CARD_STATUS, handleUpdateCardStatus);
    };
  }, [handleResendMessage, handleSendTextMessage]);

  return null;
};

InvisibleUIKitEventController.displayName =
  'ChatAreaInvisibleUIKitEventController';
