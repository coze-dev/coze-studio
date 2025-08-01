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

import { type ShortCutCommand } from '@coze-agent-ide/tool-config';

export const shortcutIconAndNameVisibleControl = (
  shortcut: ShortCutCommand,
): {
  iconVisible: boolean;
  nameVisible: boolean;
  splitLineVisible: boolean;
} => {
  const { bot_info } = shortcut;
  const iconVisible = !!bot_info?.icon_url;
  const nameVisible = !!bot_info?.name;
  const splitLineVisible = iconVisible || nameVisible;
  return { iconVisible, nameVisible, splitLineVisible };
};
