import { useChatAreaStoreSet } from '../context/use-chat-area-context';
import {
  isAnswerFinishVerboseMessage,
  isFakeInterruptVerboseMessage,
} from '../../utils/verbose';
import { findMessageById, getIsPureAnswerMessage } from '../../utils/message';
import { type Message, type MessageGroup } from '../../store/types';
import { type MessagesStore } from '../../store/messages';

export const getPureAnswerMessagesByGroup = (
  useMessagesStore: MessagesStore,
  groupId?: string,
) => {
  const { messages, messageGroupList } = useMessagesStore.getState();
  const targetGroup = messageGroupList.find(g => g.groupId === groupId);
  if (!targetGroup) {
    return null;
  }
  return targetGroup.memberSet.llmAnswerMessageIdList
    .map(id => findMessageById(messages, id))
    .filter((msg): msg is Message => !!msg)
    .filter(getIsPureAnswerMessage);
};

export const getLastPureAnswerMessage = (
  useMessagesStore: MessagesStore,
  groupId?: string,
) => {
  const messages = getPureAnswerMessagesByGroup(useMessagesStore, groupId);
  if (!messages) {
    return null;
  }
  return messages.at(0) || null;
};

export const useIsGroupAnswerFinish = ({ memberSet }: MessageGroup) => {
  const { useMessagesStore } = useChatAreaStoreSet();

  return useMessagesStore(state => {
    const functionCallMessages = memberSet.functionCallMessageIdList.map(id =>
      state.findMessage(id),
    );
    const hasFinalAnswer = functionCallMessages.some(
      message => message && isAnswerFinishVerboseMessage(message),
    );
    return Boolean(hasFinalAnswer);
  });
};

// 非真实运行中止的消息
export const useIsGroupFakeInterruptAnswer = ({ memberSet }: MessageGroup) => {
  const { useMessagesStore } = useChatAreaStoreSet();

  return useMessagesStore(state => {
    const functionCallMessages = memberSet.functionCallMessageIdList.map(id =>
      state.findMessage(id),
    );

    const hasFakeInterruptMessage = functionCallMessages.some(
      message => message && isFakeInterruptVerboseMessage(message),
    );
    return Boolean(hasFakeInterruptMessage);
  });
};
