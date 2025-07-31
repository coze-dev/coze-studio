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
import { STARTNODE } from '@coze-agent-ide/bot-plugin-tools/pluginModal/config';
import { PluginDocs } from '@coze-agent-ide/bot-plugin-export/pluginDocs';

import s from './index.module.less';

// @ts-expect-error -- linter-disable-autofix
export const SecurityCheckFailed = ({ step }) => (
  <div className={s['error-msg']}>
    {step !== STARTNODE
      ? I18n.t('plugin_parameter_create_modal_safe_error')
      : I18n.t('plugin_tool_create_modal_safe_error')}
    <PluginDocs />
  </div>
);
