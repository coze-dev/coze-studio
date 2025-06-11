import { type PropsWithChildren } from 'react';

import { AnswerActionStoreContext } from '../store/context';
import { AnswerActionPreferenceContext } from '../preference/context';
import { useInitStoreSet } from '../../hooks/use-init-store-set';

export const AnswerActionProvider: React.FC<
  PropsWithChildren<{
    enableBotTriggerControl: boolean;
  }>
> = ({ children, enableBotTriggerControl }) => {
  const storeSet = useInitStoreSet();

  return (
    <AnswerActionStoreContext.Provider value={storeSet}>
      <AnswerActionPreferenceContext.Provider
        value={{ enableBotTriggerControl }}
      >
        {children}
      </AnswerActionPreferenceContext.Provider>
    </AnswerActionStoreContext.Provider>
  );
};
