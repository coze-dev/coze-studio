import { useChatAreaStoreSet } from '../context/use-chat-area-context';

export const useGetMessages = () => {
  const { useMessagesStore } = useChatAreaStoreSet();

  return (messageIdList: string[]) => {
    const { messages } = useMessagesStore.getState();
    return messages.filter(message =>
      messageIdList.includes(message.message_id),
    );
  };
};
