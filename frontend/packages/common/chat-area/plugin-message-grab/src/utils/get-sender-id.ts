import {
  type ChatAreaPluginContext,
  type PluginMode,
} from '@coze-common/chat-area';

export const getSenderId = ({
  messageId,
  chatAreaPluginContext,
}: {
  messageId: string;
  chatAreaPluginContext: ChatAreaPluginContext<PluginMode.Writeable>;
}) => {
  if (!messageId) {
    return;
  }

  const senderId =
    chatAreaPluginContext.readonlyAPI.message.findMessage(messageId)?.sender_id;

  return senderId;
};
