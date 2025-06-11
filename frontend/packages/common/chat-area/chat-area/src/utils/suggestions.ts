import { type Message } from '../store/types';
import { type IdAndSuggestion } from '../store/suggestions';

export const getIsSuggestion = (message: Message) =>
  message.type === 'follow_up';

export const splitMessageAndSuggestions = (messages: Message[]) => {
  const messageList: Message[] = [];
  const idAndSuggestions: IdAndSuggestion[] = [];
  for (const msg of messages) {
    if (getIsSuggestion(msg)) {
      /**
       * 对话过程中最后返回的 suggestion 会出现在历史消息的第一条
       * 对话过程中采取 push suggestion 此处处理历史消息需要采取 unshift
       */

      idAndSuggestions.unshift({
        replyId: msg.reply_id,
        suggestion: msg.content,
      });
    } else {
      messageList.push(msg);
    }
  }
  return {
    messageList,
    idAndSuggestions,
  };
};
