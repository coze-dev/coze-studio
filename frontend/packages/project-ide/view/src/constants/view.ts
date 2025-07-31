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

import { URI } from '@coze-project-ide/core';

import { LayoutPanelType } from '../types';
import { BOTTOM_PANEL_ID, MAIN_PANEL_ID } from './area-id';

export const VIEW_CONTAINER_CLASS_NAME = 'flowide-container';

export const PANEL_CLASS_NAME_MAP: Record<LayoutPanelType, URI> = {
  [LayoutPanelType.TOP_BAR]: new URI('flowide:///panel/flowide-top-bar'),
  [LayoutPanelType.ACTIVITY_BAR]: new URI(
    'flowide:///panel/flowide-activity-bar',
  ),
  [LayoutPanelType.PRIMARY_SIDEBAR]: new URI(
    'flowide:///panel/flowide-primary-sidebar',
  ),
  [LayoutPanelType.MAIN_PANEL]: new URI(`flowide:///panel/${MAIN_PANEL_ID}`),
  [LayoutPanelType.SECONDARY_SIDEBAR]: new URI(
    'flowide:///panel/flowide-secondary-sidebar',
  ),
  [LayoutPanelType.BOTTOM_PANEL]: new URI(
    `flowide:///panel/${BOTTOM_PANEL_ID}`,
  ),
  [LayoutPanelType.STATUS_BAR]: new URI('flowide:///panel/flowide-status-bar'),
  [LayoutPanelType.RIGHT_BAR]: new URI('flowide:///panel/flowide-right-bar'),
};

export const ALL_PANEL_TYPES = [
  LayoutPanelType.TOP_BAR,
  LayoutPanelType.ACTIVITY_BAR,
  LayoutPanelType.PRIMARY_SIDEBAR,
  LayoutPanelType.MAIN_PANEL,
  LayoutPanelType.SECONDARY_SIDEBAR,
  LayoutPanelType.BOTTOM_PANEL,
  LayoutPanelType.STATUS_BAR,
  LayoutPanelType.RIGHT_BAR,
];

export const SPLIT_PANEL_CLASSNAME = 'flow-split-widget-panel';
