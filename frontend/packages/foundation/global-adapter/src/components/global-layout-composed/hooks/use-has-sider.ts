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

import { useLocation } from 'react-router-dom';

import { useIsLogined } from '@coze-arch/foundation-sdk';
import { useRouteConfig } from '@coze-arch/bot-hooks';

export const useHasSider = () => {
  const config = useRouteConfig();
  const location = useLocation();
  const isLogined = useIsLogined();
  const queryParams = new URLSearchParams(location.search);
  const pageMode = queryParams.get('page_mode');

  // Priority is given to using page_mode parameters to determine whether it is full screen mode
  if (config.pageModeByQuery && pageMode === 'modal') {
    return false;
  }

  const notCheckLoginPage =
    (config.requireAuth && config.requireAuthOptional) || !config.requireAuth;
  // Pages that can be accessed without logging in
  if (config.hasSider && notCheckLoginPage && !isLogined) {
    return false;
  }

  return !!config.hasSider;
};
