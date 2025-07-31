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

import { useState, type MouseEvent } from 'react';

import { logger } from '@coze-arch/logger';
import { I18n } from '@coze-arch/i18n';
import { IconCozTrashCan } from '@coze-arch/coze-design/icons';
import { IconButton, Popconfirm } from '@coze-arch/coze-design';

export const DeleteButton = ({
  className,
  onDelete,
}: {
  className?: string;
  onDelete?: () => Promise<void>;
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const handleClose = () => setModalVisible(false);
  const showDeleteConfirm = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setModalVisible(true);
  };

  const handleDelete = () =>
    // Use promises to make the button appear loading, see
    // https://semi.design/zh-CN/feedback/popconfirm
    new Promise((resolve, reject) => {
      onDelete?.()
        .then(() => {
          handleClose();
          resolve(true);
        })
        .catch(error => {
          // Handle errors
          logger.error({
            error: error as Error,
            eventName: 'delete workflow error',
          });
          reject(error);
        });
    });
  return (
    <div className={className} onClick={e => e.stopPropagation()}>
      <Popconfirm
        visible={modalVisible}
        title={I18n.t('scene_workflow_popup_delete_confirm_title')}
        content={I18n.t('scene_workflow_popup_delete_confirm_subtitle')}
        okText={I18n.t('shortcut_modal_confirm')}
        cancelText={I18n.t('shortcut_modal_cancel')}
        trigger="click"
        position="bottomRight"
        onConfirm={handleDelete}
        onCancel={handleClose}
        okButtonColor="red"
      >
        <IconButton
          icon={<IconCozTrashCan />}
          type="primary"
          onClick={showDeleteConfirm}
        />
      </Popconfirm>
    </div>
  );
};
