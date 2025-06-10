import { type Message } from '../types';
import { getIsTriggerMessage } from '../../utils/message';
import { type MemberSetType } from '../../plugin/types/plugin-class/message-life-cycle';

export interface GetDefaultDistributeMemberSetTypePrams {
  message: Message;
}

export const getDefaultDistributeMemberSetType: (
  params: GetDefaultDistributeMemberSetTypePrams,
) => MemberSetType = ({ message }) => {
  if (message.role === 'user') {
    return 'user';
  }

  if (message.type === 'answer' || getIsTriggerMessage(message)) {
    return 'llm';
  } else if (message.type === 'follow_up') {
    return 'follow_up';
  } else {
    return 'function_call';
  }
};
