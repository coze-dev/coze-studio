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

import { type PluginApi } from '@coze-arch/bot-api/developer_api';
import { type PluginInfoProps } from '@coze-studio/plugin-shared';

export const getPluginApiKey = (api: Pick<PluginApi, 'plugin_id' | 'name'>) =>
  (api.plugin_id ?? '0') + (api.name ?? '');

export { getEnv } from './get-env';

export const doFormatTypeAndCreation = (info?: PluginInfoProps) =>
  info ? `${info?.plugin_type}-${info?.creation_method}` : '';
