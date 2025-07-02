import { useContext } from 'react';

import { isValidContext } from '../../utils/is-valid-context';
import { StoreSetContext } from '../../context/store-set';
import { NullableChatAreaContext } from '../../context/chat-area-context/context';

/**
 * 内部使用, 这个千万不要对外导出
 */
export const useChatAreaContext = () => {
  const chatAreaContext = useContext(NullableChatAreaContext);
  const storeSetContext = useContext(StoreSetContext);
  if (!isValidContext(chatAreaContext) || !isValidContext(storeSetContext)) {
    throw new Error('chatAreaContext is not valid');
  }

  return chatAreaContext;
};

/**
 * only for 内部使用
 */
export const useChatAreaStoreSet = () => {
  const storeSetContext = useContext(StoreSetContext);
  if (!isValidContext(storeSetContext)) {
    throw new Error('chatAreaContext is not valid');
  }

  return storeSetContext;
};
