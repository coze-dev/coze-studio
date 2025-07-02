import { useState } from 'react';

import { localStorageService } from '@coze-foundation/local-storage';

const SESSION_HIDDEN_KEY = 'coze-promptkit-recommend-pannel-hidden-key';

export const useSetSessionVisiblePersist = (key: string) => {
  const [isSessionVisible, setIsSessionVisible] = useState(isKeyExist(key));
  return {
    isSessionVisible,
    toggleSessionVisible: (visible: boolean) => {
      const oldValue = localStorageService.getValue(SESSION_HIDDEN_KEY) || '';
      if (isKeyExist(key) && visible) {
        return;
      }
      if (visible) {
        localStorageService.setValue(
          SESSION_HIDDEN_KEY,
          oldValue ? `${oldValue},${key}` : key,
        );
        setIsSessionVisible(true);
        return;
      }
      localStorageService.setValue(
        SESSION_HIDDEN_KEY,
        oldValue.replace(key, ''),
      );
      setIsSessionVisible(false);
    },
  };
};

const isKeyExist = (key: string) => {
  const oldValue = localStorageService.getValue(SESSION_HIDDEN_KEY);
  return oldValue?.includes(key);
};
