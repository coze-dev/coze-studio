import { I18n } from '@coze-arch/i18n';
import { Modal } from '@coze-arch/coze-design';

import { MarkdownBoxViewer } from './markdown-viewer';

import css from './markdown-modal.module.less';

interface MarkdownModalProps {
  visible?: boolean;
  value: string;
  onClose: () => void;
}

export const MarkdownModal: React.FC<MarkdownModalProps> = ({
  visible,
  value,
  onClose,
}) => (
  <Modal
    visible={visible}
    title={I18n.t('creat_project_use_template_preview')}
    size="large"
    getPopupContainer={() => document.body}
    onCancel={onClose}
  >
    <MarkdownBoxViewer value={value} className={css['markdown-modal']} />
  </Modal>
);
