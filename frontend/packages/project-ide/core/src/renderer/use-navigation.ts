/*
 * Copyright 2025 coze-dev Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { useCallback } from 'react';

import { NavigationHistory, NavigationService } from '../navigation';
import { type URI } from '../common';
import { useIDEService } from './use-ide-service';

const useNavigation = (): {
  /** You can pass in a URI or string, starting with/when passing in a string, aligned with react-router-dom */
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
