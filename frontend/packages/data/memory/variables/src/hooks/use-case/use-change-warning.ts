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

import { useState } from 'react';

import { useHiddenSession } from '@/hooks/use-case/use-hidden-session';

export const useChangeWarning = () => {
  const [isShowBanner, setIsShowBanner] = useState(false);
  const { isSessionHidden, hideSession } = useHiddenSession(
    'variable_config_change_banner_remind',
  );

  const showBanner = () => {
    setIsShowBanner(true);
  };

  const hideBanner = () => {
    setIsShowBanner(false);
  };

  const hideBannerForever = () => {
    hideSession();
    setIsShowBanner(false);
  };

  return {
    isShowBanner: isShowBanner && !isSessionHidden,
    showBanner,
    hideBanner,
    hideBannerForever,
  };
};
