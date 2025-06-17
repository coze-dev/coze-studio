import { I18n } from '@coze-arch/i18n';
import { Button } from '@coze-arch/coze-design';

import { useGlobalState } from '@/hooks';

export interface BasePublishButtonProps {
  disabled?: boolean;
  className?: string;
  step: string;
  setStep: (v: string) => void;
  onPublish: () => void;
}

export const BasePublishButton: React.FC<BasePublishButtonProps> = ({
  disabled,
  className,
  setStep,
  onPublish,
}) => {
  const { publishing } = useGlobalState();

  const handleClick = () => {
    setStep('none');
    onPublish();
  };

  return (
    <Button
      disabled={disabled}
      className={className}
      loading={publishing}
      onClick={handleClick}
    >
      {I18n.t('workflow_detail_title_publish')}
    </Button>
  );
};
