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

import React, { useState } from 'react';

import { DeleteAction, DeleteType, workflowApi } from '@coze-workflow/base';
import { I18n } from '@coze-arch/i18n';
import { CustomError } from '@coze-arch/bot-error';
import { type ResourceInfo, ResType } from '@coze-arch/bot-api/plugin_develop';
import { Modal, Toast } from '@coze-arch/coze-design';

import { reporter, wait } from '@/utils';

import {
  type CommonActionProps,
  type DeleteActionReturn,
  type DeleteModalConfig,
} from './type';

// eslint-disable-next-line @coze-arch/max-line-per-function
export const useDeleteAction = (
  props: CommonActionProps,
): DeleteActionReturn => {
  const { spaceId, userId, refreshPage } = props;
  const [modalVisible, setModalVisible] = useState(false);
  const [deleteModalConfig, setDeleteModalConfig] =
    useState<DeleteModalConfig>();
  /**
   * Logic comes from useWorkflowList (@code-workflow/components), no longer reused because imported parameters have changed
   * @param item
   */
  const handleDeleteWorkflowResource = async (item: ResourceInfo) => {
    if (!item.res_id || !spaceId) {
      throw new CustomError('normal_error', 'miss workflowId or spaceID');
    }

    reporter.info({
      message: 'workflow_list_delete_row',
      meta: {
        workflowId: item.res_id,
      },
    });

    let deleteType = DeleteType.CanDelete;

    // Delete mode from server level query
    const resp = await workflowApi.GetDeleteStrategy({
      space_id: spaceId,
      workflow_id: item.res_id,
    });
    deleteType = resp.data;

    const canDelete = [
      DeleteType.CanDelete,
      DeleteType.RejectProductDraft,
    ].includes(deleteType);

    const deleteFuc = async (deleteParams?: {
      needDeleteBlockwise: boolean;
    }) => {
      const needDeleteBlockwise = deleteParams?.needDeleteBlockwise;
      const action = needDeleteBlockwise
        ? DeleteAction.BlockwiseDelete
        : DeleteAction.BlockwiseUnbind;

      if (!item.res_id || !spaceId) {
        throw new CustomError('normal_error', 'miss workflowId or spaceID');
      }
      try {
        await workflowApi.DeleteWorkflow({
          space_id: spaceId,
          workflow_id: item.res_id,
          action,
        });

        Toast.success({
          content: I18n.t('workflow_add_delete_success'),
          showClose: false,
        });

        reporter.info({
          message: 'workflow_list_delete_row_success',
        });

        // Bottom line leader/follower delay
        await wait(300);

        // refresh list
        refreshPage?.();
      } catch (error) {
        reporter.error({
          message: 'workflow_list_delete_row_fail',
          error,
        });
        Toast.error({
          content: I18n.t('workflow_add_delete_fail'),
          showClose: false,
        });
      }
    };
    return {
      canDelete,
      deleteType,
      handleDelete: canDelete ? deleteFuc : undefined,
    };
  };

  const deleteAction = async (record: ResourceInfo) => {
    const isSelfCreator = record.creator_id === userId;
    const deleteConfig = await handleDeleteWorkflowResource(record);
    let title = I18n.t('delete_title');
    if (deleteConfig.deleteType === DeleteType.UnListProduct) {
      title = I18n.t('workflowstore_unable_to_delete_workflow');
    }

    let desc = I18n.t('library_delete_desc');
    if (deleteConfig.deleteType === DeleteType.UnListProduct) {
      if (isSelfCreator) {
        desc = I18n.t('workflowstore_the_workflow_has_been');
      } else {
        desc = I18n.t('workflowstore_delete_permission');
      }
    }

    let okText = deleteConfig.canDelete
      ? I18n.t('confirm')
      : I18n.t('workflowstore_remove_wf');
    if (
      deleteConfig.deleteType === DeleteType.UnListProduct &&
      !isSelfCreator
    ) {
      okText = '';
    }

    let cancelText = I18n.t('cancel');
    if (
      deleteConfig.deleteType === DeleteType.UnListProduct &&
      !isSelfCreator
    ) {
      cancelText = I18n.t('confirm');
    }

    setDeleteModalConfig({
      title,
      desc,
      cancelText,
      okText,
      okHandle: () => {
        if (deleteConfig.canDelete) {
          deleteConfig?.handleDelete?.({
            needDeleteBlockwise: false,
          });
        } else {
          if (
            deleteConfig.deleteType === DeleteType.UnListProduct &&
            isSelfCreator
          ) {
            window.open(
              `/store/${
                record.res_type === ResType.Workflow ? 'workflow' : 'imageflow'
              }/${record.res_id}?entity_id=true`,
              '_blank',
            );
          }
        }
      },
    });
    setModalVisible(true);
  };
  const deleteModal = (
    <Modal
      maskClosable={false}
      centered={true}
      visible={modalVisible}
      title={deleteModalConfig?.title ?? ''}
      onOk={() => {
        setModalVisible(false);
        deleteModalConfig?.okHandle();
      }}
      onCancel={() => {
        setModalVisible(false);
      }}
      closeOnEsc={true}
      cancelText={deleteModalConfig?.cancelText}
      okText={deleteModalConfig?.okText}
      okButtonColor={'red'}
    >
      <div className="coz-common-content">{deleteModalConfig?.desc ?? ''}</div>
    </Modal>
  );
  return { deleteModal, actionHandler: deleteAction };
};
