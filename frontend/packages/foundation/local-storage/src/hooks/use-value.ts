import { useEffect, useState } from 'react';

import { localStorageService } from '../core';
import { type LocalStorageCacheKey } from '../config';

export const useValue = (key: LocalStorageCacheKey): string | undefined => {
  const [value, setValue] = useState(() => localStorageService.getValue(key));

  useEffect(() => {
    const callback = () => {
      setValue(localStorageService.getValue(key));
    };
    localStorageService.on('change', callback);
    return () => {
      localStorageService.off('change', callback);
    };
  }, [key]);
  return value;
};
