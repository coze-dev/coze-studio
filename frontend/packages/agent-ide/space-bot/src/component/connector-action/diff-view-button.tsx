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
import { EVENT_NAMES } from '@coze-arch/bot-tea';
import { Tooltip, UIIconButton } from '@coze-arch/bot-semi';
import { IconViewDiff } from '@coze-arch/bot-icons';
import { type PublishConnectorInfo } from '@coze-arch/bot-api/developer_api';
import { sendTeaEventInBot } from '@coze-agent-ide/agent-ide-commons';

import { useBotModeStore } from '../../store/bot-mode';
import { useConnectorDiffModal } from '../../hook/use-connector-diff-modal';

export const DiffViewButton: React.FC<{
  record: PublishConnectorInfo;
  isMouseIn: boolean;
}> = ({ record, isMouseIn }) => {
  const { open: connectorDiffModalOpen, node: connectorDiffModalNode } =
    useConnectorDiffModal();
  const isCollaboration = useBotModeStore(s => s.isCollaboration);
  const openConnectorDiffModal = (info: PublishConnectorInfo) => {
    sendTeaEventInBot(EVENT_NAMES.bot_publish_difference, {
      platform_type: info.name,
    });
    connectorDiffModalOpen(info);
  };

  return (
    <>
      {isMouseIn && isCollaboration ? (
        <Tooltip content={I18n.t('devops_publish_multibranch_viewdiff')}>
          <UIIconButton
            onClick={() => {
              openConnectorDiffModal(record);
            }}
            icon={<IconViewDiff color="#4D53E8" />}
          ></UIIconButton>
        </Tooltip>
      ) : null}
      {connectorDiffModalNode}
    </>
  );
};
