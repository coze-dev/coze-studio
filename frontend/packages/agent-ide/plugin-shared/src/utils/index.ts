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
import { type PluginApi } from '@coze-arch/bot-api/developer_api';
import IconAllActive from '@coze-common/assets/svg/icon_all_active.svg';
import IconAll from '@coze-common/assets/svg/icon_all.svg';
import IconAIActive from '@coze-common/assets/svg/icon_ai_active.svg';
import IconAI from '@coze-common/assets/svg/icon_ai.svg';

export const getDefaultPluginCategory = () => ({
  active_icon_url: IconAllActive,
  icon_url: IconAll,
  id: '',
  name: I18n.t('All'),
});

export const getRecommendPluginCategory = () => ({
  active_icon_url: IconAIActive,
  icon_url: IconAI,
  id: 'recommend',
  name: I18n.t('plugin_category_auto_suggestion'),
});

export const getPluginApiKey = (api: Pick<PluginApi, 'plugin_id' | 'name'>) =>
  (api.plugin_id ?? '0') + (api.name ?? '');
