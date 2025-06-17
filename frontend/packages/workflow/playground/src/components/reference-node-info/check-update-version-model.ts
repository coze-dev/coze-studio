import { I18n } from '@coze-arch/i18n';
import { Modal } from '@coze-arch/coze-design';

export const checkUpdateVersionModel = (content: string) =>
  new Promise<boolean>(resolve => {
    Modal.confirm({
      title: I18n.t('workflow_version_update_model_title'),
      content,
      okText: I18n.t('confirm'),
      cancelText: I18n.t('cancel'),
      onOk: () => {
        resolve(true);
      },
      onCancel: () => resolve(false),
    });
  });
