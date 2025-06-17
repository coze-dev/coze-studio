import { useDataModalWithCoze } from '@coze-data/utils';
import { I18n } from '@coze-arch/i18n';
import { type ButtonColor } from '@coze-arch/coze-design/types';

export interface IDeleteModalProps {
  onDel: () => void | Promise<void>;
}

export const useSliceDeleteModal = ({ onDel }: IDeleteModalProps) => {
  const { modal, open, close } = useDataModalWithCoze({
    title: I18n.t('delete_title'),
    cancelText: I18n.t('Cancel'),
    okText: I18n.t('Delete'),
    showCloseIcon: false,
    okButtonColor: 'red' as ButtonColor,
    okButtonProps: {
      type: 'danger',
    },
    onOk: async () => {
      await onDel?.();
      close?.();
    },
    onCancel: () => close(),
  });

  return {
    node: modal(
      <div className={'coz-fg-secondary'}>{I18n.t('delete_desc')}</div>,
    ),
    delete: open,
    close,
  };
};
