import { useCallback } from 'react';

import { NavigationHistory, NavigationService } from '../navigation';
import { type URI } from '../common';
import { useIDEService } from './use-ide-service';

const useNavigation = (): {
  /** 可传入 URI 或 string，传入 string 时以 / 开头，和 react-router-dom 对齐 */
  navigate: (uri: URI | string, replace?: boolean, options?: any) => void;
  history: NavigationHistory;
  back: () => Promise<void>;
  forward: () => Promise<void>;
} => {
  const navigationService = useIDEService<NavigationService>(NavigationService);
  const historyService = useIDEService<NavigationHistory>(NavigationHistory);

  const navigate = useCallback(
    (uri: URI | string, replace?: boolean, options?: any) =>
      navigationService.goto(uri, replace, options),
    [navigationService],
  );

  const back = useCallback(() => navigationService.back(), [navigationService]);
  const forward = useCallback(
    () => navigationService.forward(),
    [navigationService],
  );

  return { navigate, history: historyService, back, forward };
};

export { useNavigation };
