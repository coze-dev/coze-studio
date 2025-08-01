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

import { type ReactJsonViewProps } from 'react-json-view';

import { TopoType } from '@coze-arch/bot-api/dp_manage_api';
import { SpanStatus } from '@coze-arch/bot-api/debugger_api';

import {
  DebugPanelLayout,
  type DebugPanelLayoutConfig,
  type DebugPanelLayoutTemplateConfig,
  type QueryFilterItem,
} from '../typings';
import { FILTERING_OPTION_ALL } from '.';

export const EXECUTE_STATUS_FILTERING_OPTIONS: QueryFilterItem[] = [
  {
    id: FILTERING_OPTION_ALL,
    name: 'query_status_all',
  },
  {
    id: SpanStatus.Error,
    name: 'query_status_failed',
  },
  {
    id: SpanStatus.Success,
    name: 'query_status_completed',
  },
];

export enum GraphTabEnum {
  RunTree = 'RunTree',
  Flamethread = 'Flamethread',
}

export const DEBUG_PANEL_LAYOUT_DEFAULT_TEMPLATE_INFO: DebugPanelLayoutTemplateConfig =
  {
    side: {
      [DebugPanelLayout.Overall]: {
        width: {
          min: 400,
          max: 800,
        },
        height: {},
      },
      [DebugPanelLayout.Summary]: {
        width: {},
        height: {
          min: 8,
          max: 150,
        },
      },
      [DebugPanelLayout.Chat]: {
        width: {},
        height: {
          min: 1,
          max: 500,
        },
      },
    },
    bottom: {
      [DebugPanelLayout.Overall]: {
        width: {},
        height: {},
      },
      [DebugPanelLayout.Summary]: {
        width: {},
        height: {},
      },
      [DebugPanelLayout.Chat]: {
        width: {},
        height: {},
      },
    },
  };

export const DEBUG_PANEL_LAYOUT_DEFAULT_INFO: DebugPanelLayoutConfig = {
  side: {
    [DebugPanelLayout.Overall]: 400,
    [DebugPanelLayout.Summary]: 124,
    [DebugPanelLayout.Chat]: 280,
  },
  bottom: {
    [DebugPanelLayout.Overall]: 0,
    [DebugPanelLayout.Summary]: 0,
    [DebugPanelLayout.Chat]: 0,
  },
};

export const REACT_JSON_VIEW_CONFIG: Partial<ReactJsonViewProps> = {
  name: false,
  displayDataTypes: false,
  indentWidth: 2,
  iconStyle: 'triangle',
  enableClipboard: false,
  collapsed: 5,
  collapseStringsAfterLength: 300,
};

export const topologyTypeConfig: Record<TopoType, string> = {
  [TopoType.Agent]: 'Agent',
  [TopoType.AgentFlow]: 'AgentFlow',
  [TopoType.Workflow]: 'Workflow',
};
