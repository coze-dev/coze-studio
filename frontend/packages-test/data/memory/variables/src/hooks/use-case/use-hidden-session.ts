import { useState } from 'react';

import { localStorageService } from '@coze-foundation/local-storage';

const SESSION_HIDDEN_KEY = 'coze-home-session-area-hidden-key';

export const useHiddenSession = (key: string) => {
  const [isSessionHidden, setIsSessionHidden] = useState(isKeyExist(key));
  return {
    isSessionHidden,
    hideSession: () => {
      if (isKeyExist(key)) {
        return;
      }
      const oldValue = localStorageService.getValue(SESSION_HIDDEN_KEY) || '';
      localStorageService.setValue(
        SESSION_HIDDEN_KEY,
        oldValue ? `${oldValue},${key}` : key,
      );
      setIsSessionHidden(true);
    },
  };
};

const isKeyExist = (key: string) => {
  const oldValue = localStorageService.getValue(SESSION_HIDDEN_KEY);
  return oldValue?.includes(key);
};
