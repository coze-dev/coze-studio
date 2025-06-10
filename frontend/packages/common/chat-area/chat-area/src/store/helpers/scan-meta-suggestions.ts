import { type MessageGroup } from '../types';

/**
 * 必须在处理完 showContextDivider 后才可以调用
 */
export const scanAndMarkShowSuggestions = (
  messageGroupList: MessageGroup[],
) => {
  const lastMessageGroup = messageGroupList.at(0);
  if (!lastMessageGroup) {
    return;
  }
  lastMessageGroup.showSuggestions = !lastMessageGroup.showContextDivider;
};
