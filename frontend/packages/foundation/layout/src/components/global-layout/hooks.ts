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

import { useEffect } from 'react';

import { isMobile, setMobileBody, setPCBody } from '@coze-arch/bot-utils';
import {
  useIsResponsive,
  useIsResponsiveByRouteConfig,
  useRouteConfig,
} from '@coze-arch/bot-hooks';

import { useSignMobileStore } from '../../store';
import { useMobileTips } from '../../hooks';
import { useGlobalLayoutContext } from './context';

export const useLayoutResponsive = () => {
  const { mobileTips, setMobileTips } = useSignMobileStore();
  const { node: mobileTipsModal, open: openMobileTipsModal } = useMobileTips();
  const config = useRouteConfig();
  const isResponsiveOld = useIsResponsive();
  const isResponsiveByRouteConfig = useIsResponsiveByRouteConfig();
  const isResponsive = isResponsiveOld || isResponsiveByRouteConfig;

  useEffect(() => {
    if (config.showMobileTips) {
      if (!mobileTips && isMobile()) {
        openMobileTipsModal(); // Not suitable for mobile end pop-up window prompt
        setMobileTips(true);
      }

      if (isResponsive) {
        setMobileBody();
      } else {
        setPCBody();
      }
    }
  }, [config.showMobileTips, isResponsive]);
  return {
    isResponsive,
    mobileTipsModal: config.showMobileTips ? mobileTipsModal : null,
  };
};

export const useOpenGlobalLayoutSideSheet = () => {
  const { setSideSheetVisible } = useGlobalLayoutContext();
  return () => {
    setSideSheetVisible(true);
  };
};
