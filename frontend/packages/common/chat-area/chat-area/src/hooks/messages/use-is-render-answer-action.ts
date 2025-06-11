import { usePreference } from '../../context/preference';
import { useMessageBoxContext } from '../../context/message-box';

export const useIsRenderAnswerAction = () => {
  const { readonly, enableMessageBoxActionBar } = usePreference();
  const { isGroupChatActive } = useMessageBoxContext();
  return enableMessageBoxActionBar && !isGroupChatActive && !readonly;
};
