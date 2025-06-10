import { useContext } from 'react';

import { BotEditorServiceContext } from './context';

export const useBotEditorService = () => {
  const serviceSet = useContext(BotEditorServiceContext);
  if (!serviceSet) {
    throw new Error('NLPrompt service not provided');
  }
  return serviceSet;
};
