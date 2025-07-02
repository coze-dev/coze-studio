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
 * 获取和修改存储在localStorage中的调试台布局数据
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
