/* eslint-disable @typescript-eslint/naming-convention */
import { createContext, useContext } from 'react';

import { type NicknameVariables, type MessageVisibilityValue } from './types';

interface MessageVisibilityContext {
  value?: MessageVisibilityValue;
  handleValueChange?: (value: MessageVisibilityValue) => void;
  nicknameVariables?: NicknameVariables;
  testId: string;
}

const messageVisibilityContext = createContext<MessageVisibilityContext>({
  testId: '',
});

export const MessageVisibilityContextProvider =
  messageVisibilityContext.Provider;
export const useMessageVisibilityContext = () =>
  useContext(messageVisibilityContext);
