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

import { useShallow } from 'zustand/react/shallow';
import { useDiffTaskStore } from '@coze-studio/bot-detail-store/diff-task';
import { useBotInfoStore } from '@coze-studio/bot-detail-store/bot-info';
import { I18n } from '@coze-arch/i18n';
import { IconCozCompare } from '@coze-arch/coze-design/icons';
import { Button } from '@coze-arch/coze-design';
import { EVENT_NAMES, sendTeaEvent } from '@coze-arch/bot-tea';
export const ModelDiffButton = (props: { readonly?: boolean }) => {
  const { readonly } = props;
  const { enterDiffMode } = useDiffTaskStore(
    useShallow(state => ({
      enterDiffMode: state.enterDiffMode,
    })),
  );
  const { botId } = useBotInfoStore(
    useShallow(state => ({
      botId: state.botId,
    })),
  );
  return (
    <Button
      icon={<IconCozCompare />}
      color="highlight"
      disabled={readonly}
      onClick={() => {
        sendTeaEvent(EVENT_NAMES.compare_mode_front, {
          bot_id: botId,
          compare_type: 'models',
          from: 'compare_button',
          source: 'bot_detail_page',
          action: 'start',
        });
        enterDiffMode({ diffTask: 'model' });
      }}
    >
      {I18n.t('compare_model_compare_model')}
    </Button>
  );
};
