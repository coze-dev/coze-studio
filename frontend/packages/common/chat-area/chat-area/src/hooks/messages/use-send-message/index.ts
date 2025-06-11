import { useChatAreaStoreSet } from '../../context/use-chat-area-context';
export {
  useResendMessage,
  useRegenerateMessage,
  useRegenerateMessageByUserMessageId,
} from './regenerate';
export {
  useCreateMultimodalMessage,
  useSendImageMessage,
  useSendFileMessage,
  useSendMultimodalMessage,
} from './file-message';

export const useSendingOrWaiting = () => {
  const { useWaitingStore } = useChatAreaStoreSet();

  return useWaitingStore(
    state => !!(state.responding || state.waiting) || state.sending,
  );
};
export { useSendTextMessage } from './text-message';
export { useSendNormalizedMessage } from './file-message';
export { useSendNewMessage } from './new-message';
