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

import { I18n } from '@coze-arch/i18n';
import { type TagColor } from '@coze-arch/bot-semi/Tag';
import { PluginType } from '@coze-arch/bot-api/plugin_develop';

export const PLUGIN_TYPE_MAP = new Map<
  PluginType,
  { label: string; color: TagColor }
>([
  [PluginType.APP, { label: I18n.t('plugin_type_app'), color: 'yellow' }],
  [PluginType.PLUGIN, { label: I18n.t('plugin_type_plugin'), color: 'blue' }],
  [PluginType.FUNC, { label: I18n.t('plugin_type_func'), color: 'blue' }],
  [
    PluginType.WORKFLOW,
    { label: I18n.t('plugin_type_workflow'), color: 'blue' },
  ],
]);

export const PLUGIN_PUBLISH_MAP = new Map<
  boolean,
  { label: string; color: string }
>([
  [
    false,
    {
      label: I18n.t('Unpublished_1'),
      color: 'var(--coz-fg-secondary)',
    },
  ],
  [true, { label: I18n.t('Published_1'), color: 'var(--coz-fg-hglt-green)' }],
]);
