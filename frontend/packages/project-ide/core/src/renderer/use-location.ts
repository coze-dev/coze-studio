import { useEffect, useState } from 'react';

import { NavigationService } from '../navigation';
import { type URI } from '../common';
import { useIDEService } from './use-ide-service';

interface LocationInfo {
  uri?: URI;
  canGoBack?: boolean;
  canGoForward?: boolean;
}

const useLocation = () => {
  const navigation = useIDEService<NavigationService>(NavigationService);
  const [location, setLocation] = useState<LocationInfo>({});

  useEffect(() => {
    const dispose = navigation.onDidHistoryChange(next => {
      setLocation({
        uri: next?.uri,
        canGoBack: navigation.canGoBack(),
        canGoForward: navigation.canGoForward(),
      });
    });
    return () => dispose.dispose();
  }, []);

  return location;
};

export { useLocation };
