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

import { useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useBotInfoStore } from '@coze-studio/bot-detail-store/bot-info';
import { useBotDetailIsReadonly } from '@coze-studio/bot-detail-store';
import { I18n } from '@coze-arch/i18n';
import { IconButton, Tooltip } from '@coze-arch/coze-design';
import { EVENT_NAMES, sendTeaEvent } from '@coze-arch/bot-tea';
import { IconHistory } from '@coze-arch/bot-icons';

import { AgentHistoryDrawer } from './components/history-drawer';

export const AgentHistoryButton = () => {
  const [visible, setVisible] = useState(false);

  const { botId, spaceId } = useBotInfoStore(
    useShallow(state => ({
      botId: state.botId,
      spaceId: state.space_id,
    })),
  );

  return (
    <>
      <Tooltip
        content={I18n.t('workflow_publish_multibranch_viewhistory')}
        position="bottom"
      >
        <IconButton
          icon={<IconHistory />}
          color="secondary"
          onClick={() => {
            sendTeaEvent(EVENT_NAMES.workflow_submit_version_history, {
              bot_id: botId,
              workspace_id: spaceId,
            });
            setVisible(true);
          }}
        />
      </Tooltip>
      <AgentHistoryDrawer
        botId={botId}
        spaceId={spaceId}
        visible={visible}
        onClose={() => setVisible(false)}
      />
    </>
  );
};
