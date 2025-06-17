import { I18n } from '@coze-arch/i18n';
import { Button } from '@coze-arch/coze-design';
interface SavePromptProps {
  mode: 'info' | 'edit' | 'create';
  isSubmitting?: boolean;
  onSubmit?: (e: React.MouseEvent) => void;
}

export const SavePrompt = ({
  mode,
  isSubmitting,
  onSubmit,
}: SavePromptProps) => (
  <Button loading={isSubmitting} onClick={onSubmit}>
    {mode === 'info' ? I18n.t('prompt_detail_copy_prompt') : I18n.t('Confirm')}
  </Button>
);
