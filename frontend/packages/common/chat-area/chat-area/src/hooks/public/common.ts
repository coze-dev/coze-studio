import { useChatAreaContext } from '../context/use-chat-area-context';
import { usePreference } from '../../context/preference';

export const useReporter = () => useChatAreaContext().reporter;

export const useMessageWidth = () => usePreference().messageWidth;

export const useChatAreaLayout = () => usePreference().layout;
