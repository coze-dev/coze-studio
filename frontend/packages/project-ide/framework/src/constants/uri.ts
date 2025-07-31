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

import { URI } from '@coze-project-ide/client';

export const URI_SCHEME = 'coze-project';

export const TOP_BAR_URI = new URI(`${URI_SCHEME}:///top-bar`);
export const MAIN_PANEL_DEFAULT_URI = new URI(`${URI_SCHEME}:///default`);

export const SIDEBAR_URI = new URI(`${URI_SCHEME}:///side-bar`);
export const SECONDARY_SIDEBAR_URI = new URI(
  `${URI_SCHEME}:///secondary-sidebar`,
);
export const SIDEBAR_RESOURCE_URI = new URI(
  `${URI_SCHEME}:///side-bar/resource`,
);
export const SIDEBAR_CONFIG_URI = new URI(`${URI_SCHEME}:///side-bar/config`);

export const UI_BUILDER_URI = new URI(`${URI_SCHEME}:///ui-builder`);
export const UI_BUILDER_CONTENT = new URI(
  `${URI_SCHEME}:///ui-builder/content`,
);

export const CONVERSATION_URI = new URI(`${URI_SCHEME}:///session`);
