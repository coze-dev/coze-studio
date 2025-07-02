import { isValidContext } from '../../utils/is-valid-context';
import {
  useChatAreaContext,
  useChatAreaStoreSet,
} from './use-chat-area-context';

export const useChatArea = () => {
  const chatAreaContext = useChatAreaContext();
  const { useOnboardingStore, useSectionIdStore } = useChatAreaStoreSet();

  if (!isValidContext(chatAreaContext)) {
    throw new Error('chatAreaContext is not valid');
  }

  const { refreshMessageList, reporter } = chatAreaContext;

  const {
    partialUpdateOnboardingData,
    updatePrologue,
    immerUpdateSuggestionById,
    immerAddSuggestion,
    immerDeleteSuggestionById,
    setSuggestionList,
    recordBotInfo,
  } = useOnboardingStore.getState();

  const getOnboardingContent = () => {
    const { prologue, suggestions } = useOnboardingStore.getState();
    return { prologue, suggestions };
  };

  return {
    partialUpdateOnboardingData,
    updatePrologue,
    immerAddSuggestion,
    immerUpdateSuggestionById,
    immerDeleteSuggestionById,
    getOnboardingContent,
    refreshMessageList,
    setOnboardingSuggestionList: setSuggestionList,
    reporter,
    recordBotInfo,
    getLatestSectionId: () => useSectionIdStore.getState().latestSectionId,
  };
};
