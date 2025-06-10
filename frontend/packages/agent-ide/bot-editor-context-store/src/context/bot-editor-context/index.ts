import { useContext } from 'react';

import { recordExhaustiveCheck } from '../../utils/exhaustive-check';
import { BotEditorContext } from './context';

export const useBotEditor = () => {
  const context = useContext(BotEditorContext);
  const { storeSet, ...rest } = context;
  recordExhaustiveCheck(rest);
  if (!storeSet) {
    throw new Error('invalid BotEditorContext');
  }
  return { storeSet };
};
