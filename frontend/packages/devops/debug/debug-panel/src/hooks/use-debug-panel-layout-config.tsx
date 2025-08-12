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

import { useRef } from 'react';

import { produce } from 'immer';

import { isJsonString } from '../utils';
import { type DebugPanelLayoutConfig } from '../typings';
import { DEBUG_PANEL_LAYOUT_DEFAULT_INFO } from '../consts/static';
import { DEBUG_PANEL_LAYOUT_KEY } from '../consts';

export type SetLayoutConfigAction = (value: DebugPanelLayoutConfig) => void;

export type UseDebugPanelLayoutConfig = () => [
  DebugPanelLayoutConfig,
  (input: DebugPanelLayoutConfig | SetLayoutConfigAction) => void,
];

/**
 * Get and modify debug bench layout data stored in localStorage
 * @returns UseDebugPanelLayoutConfig
 */
export const useDebugPanelLayoutConfig: UseDebugPanelLayoutConfig = () => {
  const initLayoutConfig = () => {
    const layoutConfigString = localStorage.getItem(DEBUG_PANEL_LAYOUT_KEY);
    if (layoutConfigString && isJsonString(layoutConfigString)) {
      return JSON.parse(layoutConfigString) as DebugPanelLayoutConfig;
    } else {
      return DEBUG_PANEL_LAYOUT_DEFAULT_INFO;
    }
  };

  const layoutConfigRef = useRef<DebugPanelLayoutConfig>(initLayoutConfig());

  const setLayoutConfig = (
    input: DebugPanelLayoutConfig | SetLayoutConfigAction,
  ) => {
    const layoutConfig =
      typeof input === 'function'
        ? produce(layoutConfigRef.current, draft => {
            input(draft);
          })
        : input;
    layoutConfigRef.current = layoutConfig;
    window.localStorage.setItem(
      DEBUG_PANEL_LAYOUT_KEY,
      JSON.stringify(layoutConfig),
    );
  };

  return [layoutConfigRef.current, setLayoutConfig];
};
