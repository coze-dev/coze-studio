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

import { omit } from 'lodash-es';
import type { PluginApi } from '@coze-arch/bot-api/playground_api';

import { type EnabledPluginApi } from '../types/skill';

// Filter debug_example fields to avoid exceeding model resolution length
export const getPluginApisFilterExample = (
  pluginApis: PluginApi[],
): EnabledPluginApi[] => pluginApis.map(item => omit(item, 'debug_example'));

export const getSinglePluginApiFilterExample = (
  tool: PluginApi,
): EnabledPluginApi => omit(tool, 'debug_example');
