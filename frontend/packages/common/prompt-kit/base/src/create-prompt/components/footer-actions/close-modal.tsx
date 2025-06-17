import { I18n } from '@coze-arch/i18n';
import { Button } from '@coze-arch/coze-design';

interface CloseModalProps {
  onCancel?: (e: React.MouseEvent) => void;
}

export const CloseModal = ({ onCancel }: CloseModalProps) => (
  <Button color="primary" onClick={onCancel}>
    {I18n.t('Cancel')}
  </Button>
);
