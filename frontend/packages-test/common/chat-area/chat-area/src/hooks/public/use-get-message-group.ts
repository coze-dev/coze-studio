import { useChatAreaStoreSet } from '../context/use-chat-area-context';

export const useGetMessageGroup = () => {
  const { useMessagesStore } = useChatAreaStoreSet();

  const getMessageGroupById = useMessagesStore(
    state => state.getMessageGroupById,
  );

  return (groupId: string) => getMessageGroupById(groupId);
};
