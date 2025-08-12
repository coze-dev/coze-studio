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

import classnames from 'classnames';
import { useBotInfoStore } from '@coze-studio/bot-detail-store/bot-info';
import { useBotDetailIsReadonly } from '@coze-studio/bot-detail-store';
import { I18n } from '@coze-arch/i18n';
import { OpenModalEvent, emitEvent } from '@coze-arch/bot-utils';
import { BotMode } from '@coze-arch/bot-api/playground_api';

import s from './index.module.less';

export const UploadTooltipsContent = () => {
  const isReadonly = useBotDetailIsReadonly();

  const mode = useBotInfoStore(state => state.mode);
  const isMulti = mode === BotMode.MultiMode;
  const isWorkflow = mode === BotMode.WorkflowMode;

  const botPreviewAttachI18nKey = 'bot_preview_attach_0319';

  const addApi = () => {
    if (isReadonly) {
      return;
    }
    emitEvent(OpenModalEvent.PLUGIN_API_MODAL_OPEN, { type: 1 });
  };

  return (
    <div className={s['more-btn-tooltip']} onClick={e => e.stopPropagation()}>
      {I18n.t(botPreviewAttachI18nKey, {
        placeholder:
          isMulti || isWorkflow ? (
            I18n.t('bot_preview_attach_select')
          ) : (
            <span className={classnames(s['tool-text'])} onClick={addApi}>
              {I18n.t('bot_preview_attach_select')}
            </span>
          ),
      })}
    </div>
  );
};
