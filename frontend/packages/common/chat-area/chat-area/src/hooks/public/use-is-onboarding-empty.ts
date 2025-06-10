import { useShallow } from 'zustand/react/shallow';

import { useChatAreaStoreSet } from '../context/use-chat-area-context';

export const useIsOnboardingEmpty = () => {
  const { useOnboardingStore } = useChatAreaStoreSet();

  const { prologue, suggestions } = useOnboardingStore(
    useShallow(state => ({
      prologue: state.prologue,
      suggestions: state.suggestions,
    })),
  );
  const isOnboardingEmpty = !prologue && !suggestions.length;
  return isOnboardingEmpty;
};
