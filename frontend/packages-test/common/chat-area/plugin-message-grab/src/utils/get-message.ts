import {
  type ChatAreaPluginContext,
  type PluginMode,
} from '@coze-common/chat-area';

export const getMessage = ({
  messageId,
  chatAreaPluginContext,
}: {
  messageId: string;
  chatAreaPluginContext: ChatAreaPluginContext<PluginMode.Writeable>;
}) => {
  if (!messageId) {
    return;
  }

  const message =
    chatAreaPluginContext.readonlyAPI.message.findMessage(messageId);

  return message;
};
