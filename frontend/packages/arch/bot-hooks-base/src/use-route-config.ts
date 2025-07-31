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

import { useMatches, type NavigateFunction } from 'react-router-dom';
import { type FC, useMemo } from 'react';

import { type ScreenRange } from '@coze-arch/responsive-kit';

export interface TRouteConfigGlobal {
  /**
   * display assistant
   * @default true
   * @Import open source version does not support this field
   */
  showAssistant?: boolean;
  /**
   * Show assistant guide prompt
   * @default false
   * @Import open source version does not support this field
   */
  showAssistantGuideTip?: boolean;
  /**
   * Callback function when the enterprise ID changes.
   * @Import open source version does not support this field
   * @Param enterpriseId - Changed enterprise ID.
   * @Param params - An object containing the navigation function and the current pathname.
   */
  onEnterpriseChange?: (
    enterpriseId: string,
    params: {
      navigate: NavigateFunction; // Navigation function for routing jumps.
      pathname: string; // The current path name is used to build a new path.
    },
  ) => void;
  /**
   * Whether to display the sidebar
   * @default false
   */
  hasSider?: boolean;
  /**
   * Display mobile end does not fit prompt copy
   * @default false
   */
  showMobileTips?: boolean;
  /**
   * Is authentication required?
   * @default false
   */
  requireAuth?: boolean;
  /**
   * The fallback address when the login fails
   * @default /sign
   */
  loginFallbackPath?: string;
  /**
   * @deprecated
   * Whether to allow authentication is optional
   * @default false
   */
  requireAuthOptional?: boolean;
  /**
   * The default value {rangeMax: ScreenRange. LG, include: false} is automatically applied when set to true for most previous configurations that support responsive routing
   * @default false
   */
  responsive?: { rangeMax: ScreenRange; include?: boolean } | true;
  /**
   * submenu component
   * @default undefined
   */
  subMenu?: FC<Record<string, never>>;
  /**
   * Primary navigation menu item key
   * @default undefined
   */
  menuKey?: string;
  /**
   * Secondary navigation menu item key
   * @default undefined
   */
  subMenuKey?: string;
  /**
   * Controls whether page mode is determined based on page_mode fields in the query: default side navigation mode or full screen popover mode
   * @default false
   */
  pageModeByQuery?: boolean;
}

export const useRouteConfig = <
  TConfig extends TRouteConfigGlobal = TRouteConfigGlobal,
>(
  defaults?: TConfig,
  // Force all fields to be empty
): Partial<TConfig> => {
  const matches = useMatches();

  return useMemo<Partial<TConfig>>(
    () =>
      matches.reduce(
        (res, matchedRoute) => ({
          ...res,
          ...(matchedRoute.handle as Partial<TConfig>),
          ...(matchedRoute.data as Partial<TConfig>),
        }),
        defaults ?? {},
      ),
    [matches],
  );
};
