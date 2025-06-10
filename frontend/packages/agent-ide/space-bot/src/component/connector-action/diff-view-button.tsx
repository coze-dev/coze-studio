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
