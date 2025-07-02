import { useEffect } from 'react';

import { unlockByFetch } from '../utils/fetch';

export const useUnmountUnlock = (pluginId: string) => {
  useEffect(() => {
    const unlock = () => unlockByFetch(pluginId);

    window.addEventListener('beforeunload', unlock);

    return () => {
      window.removeEventListener('beforeunload', unlock);
    };
  }, []);
};
