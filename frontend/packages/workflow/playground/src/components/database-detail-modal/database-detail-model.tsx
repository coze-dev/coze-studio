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
import { Modal } from '@coze-arch/bot-semi';
import { DatabaseDetailComponent } from '@coze-data/database-v2';

import { useGlobalState } from '@/hooks';

import { useWorkflowDetailModalStore } from './use-workflow-detail-modal-store';

import styles from './database-detail-model.module.less';

/**
 * 数据库详情弹窗
 */
export function DatabaseDetailModal() {
  const {
    databaseID,
    isVisible,
    close,
    isAddedInWorkflow,
    onChangeDatabaseToWorkflow,
    tab = 'structure',
  } = useWorkflowDetailModalStore();

  const { projectCommitVersion } = useGlobalState();

  if (!databaseID) {
    return null;
  }

  const addRemoveButtonText = isAddedInWorkflow
    ? // 这个key命名错了 应该是remove from workflow 产品已经录入了 这里还是继续用错误的key
      I18n.t('workflow_remove_to_workflow')
    : I18n.t('workflow_add_to_workflow');

  return (
    <Modal
      fullScreen
      visible={isVisible}
      footer={null}
      closable={false}
      className={styles.editDatabaseModal}
      modalContentClass="p-0"
    >
      <DatabaseDetailComponent
        version={projectCommitVersion}
        databaseId={databaseID}
        enterFrom="workflow"
        initialTab={tab}
        onClose={() => close()}
        addRemoveButtonText={addRemoveButtonText}
        onClickAddRemoveButton={() => {
          if (isAddedInWorkflow) {
            onChangeDatabaseToWorkflow();
          } else {
            onChangeDatabaseToWorkflow(databaseID);
          }

          close();
        }}
      />
    </Modal>
  );
}
