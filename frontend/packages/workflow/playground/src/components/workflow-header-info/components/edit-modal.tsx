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

import { useBoolean } from 'ahooks';
import { CreateWorkflowModal } from '@coze-workflow/components';
import { I18n } from '@coze-arch/i18n';
import { IconCozEdit } from '@coze-arch/coze-design/icons';
import { IconButton, Tooltip } from '@coze-arch/coze-design';

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
