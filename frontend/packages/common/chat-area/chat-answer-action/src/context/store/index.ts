import { useContext } from 'react';

import { AnswerActionStoreContext } from './context';

export const useAnswerActionStore = () => {
  const storeSet = useContext(AnswerActionStoreContext);
  if (!storeSet) {
    throw new Error('answer action store not provided');
  }
  return storeSet;
};
