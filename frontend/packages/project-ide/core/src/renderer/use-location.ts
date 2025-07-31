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
