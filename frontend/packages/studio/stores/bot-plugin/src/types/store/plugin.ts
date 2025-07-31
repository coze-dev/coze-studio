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

import {
  type GetUserAuthorityData,
  type GetUpdatedAPIsResponse,
  type GetPluginInfoResponse,
} from '@/types';

interface PluginState {
  readonly pluginId: string;
  readonly spaceID: string;
  projectID?: string;
  isUnlocking: boolean;
  auth?: GetUserAuthorityData;
  canEdit: boolean;
  updatedInfo?: GetUpdatedAPIsResponse;
  pluginInfo?: GetPluginInfoResponse & { plugin_id?: string };
  initSuccessed: boolean;
  version?: string;
}

interface PluginGetter {
  getIsIdePlugin: () => boolean;
}

interface PluginAction {
  initUserPluginAuth: () => void;
  checkPluginIsLockedByOthers: () => Promise<boolean>;
  wrapWithCheckLock: (fn: () => void) => () => Promise<void>;
  unlockPlugin: () => Promise<void>;
  setPluginInfo: (info: PluginState['pluginInfo']) => void;
  setUpdatedInfo: (info: GetUpdatedAPIsResponse) => void;
  initPlugin: () => Promise<void>;
  initTool: () => Promise<void>;
  init: () => Promise<void>;
  setCanEdit: (can: boolean) => void;
  setInitSuccessed: (v: boolean) => void;
  updatePluginInfoByImmer: (
    updateFn: (pluginInfo: PluginState['pluginInfo']) => void,
  ) => void;
}

export type BotPluginStateAction = PluginState & PluginGetter & PluginAction;
