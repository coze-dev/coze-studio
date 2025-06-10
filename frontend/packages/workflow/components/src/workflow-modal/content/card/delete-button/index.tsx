import { useState, type MouseEvent } from 'react';

import { logger } from '@coze-arch/logger';
import { I18n } from '@coze-arch/i18n';
import { IconCozTrashCan } from '@coze/coze-design/icons';
import { IconButton, Popconfirm } from '@coze/coze-design';

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
    // 使用 promise 让按钮出现 loading 的效果，参见
    // https://semi.design/zh-CN/feedback/popconfirm
    new Promise((resolve, reject) => {
      onDelete?.()
        .then(() => {
          handleClose();
          resolve(true);
        })
        .catch(error => {
          // 处理错误
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
