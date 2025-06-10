import { useChatAreaContext } from '../context/use-chat-area-context';

export const useManualInit = () => {
  const { manualInit } = useChatAreaContext();
  return manualInit;
};
