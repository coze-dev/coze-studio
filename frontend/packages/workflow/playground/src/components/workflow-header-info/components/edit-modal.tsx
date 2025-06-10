import { useBoolean } from 'ahooks';
import { CreateWorkflowModal } from '@coze-workflow/components';
import { I18n } from '@coze-arch/i18n';
import { IconCozEdit } from '@coze/coze-design/icons';
import { IconButton, Tooltip } from '@coze/coze-design';

import { useLatestWorkflowJson, useGlobalState } from '../../../hooks';

export const EditModal = () => {
  const globalState = useGlobalState();
  const { info, flowMode } = globalState;

  const [
    createWorkflowModalVisible,
    { setTrue: openCreateWorkflowModal, setFalse: closeCreateWorkflowModal },
  ] = useBoolean(false);

  const { getLatestWorkflowJson } = useLatestWorkflowJson();

  return (
    <>
      <Tooltip content={I18n.t('Edit')}>
        <IconButton
          data-testid="workflow.detail.title.edit"
          icon={<IconCozEdit />}
          color="secondary"
          size="mini"
          onClick={() => openCreateWorkflowModal()}
        />
      </Tooltip>

      <CreateWorkflowModal
        mode="update"
        flowMode={flowMode}
        visible={createWorkflowModalVisible}
        workFlow={info}
        onCancel={closeCreateWorkflowModal}
        getLatestWorkflowJson={getLatestWorkflowJson}
        onSuccess={() => {
          closeCreateWorkflowModal();
          globalState.reload();
        }}
      />
    </>
  );
};
