import { useDataModalWithCoze } from '@coze-data/utils';
import { I18n } from '@coze-arch/i18n';
import { type ButtonColor } from '@coze-arch/coze-design/types';

import styles from './index.module.less';

export interface IResegmentModalProps {
  onOk: () => void;
}

export const useTextResegmentModal = ({ onOk }: IResegmentModalProps) => {
  const { modal, open, close } = useDataModalWithCoze({
    width: 320,
    title: I18n.t('datasets_segment_resegment'),
    className: styles['text-resegment-modal'],
    cancelText: I18n.t('Cancel'),
    okText: I18n.t('knowledge_optimize_007'),
    okButtonColor: 'yellow' as ButtonColor,
    okButtonProps: {
      type: 'warning',
    },
    onOk: () => {
      onOk();
    },
    onCancel: () => close(),
  });

  return {
    node: modal(
      <div className={styles['text-resegment-content']}>
        {I18n.t('kl2_004')}
      </div>,
    ),
    open,
    close,
  };
};
