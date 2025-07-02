import { useEffect } from 'react';

import { I18n } from '@coze-arch/i18n';

import { ForcePushPopover, useForcePush } from '../force-push-popover';
import { BasePublishButton } from './base-publish-button';

interface PublishWithForceProps {
  disabled?: boolean;
  className?: string;
  step: string;
  setStep: (v: string) => void;
  onPublish: () => void;
}

export const PublishWithForce: React.FC<PublishWithForceProps> = ({
  onPublish,
  ...props
}) => {
  const { step, setStep } = props;
  const { visible, tryPushCheck, onCancel, onTestRun } = useForcePush();

  const handlePublish = async () => {
    setStep('force');
    if (!(await tryPushCheck())) {
      return;
    }
    onPublish();
  };

  useEffect(() => {
    if (step === 'none') {
      onCancel();
    }
  }, [step]);

  return (
    <ForcePushPopover
      visible={visible}
      title={I18n.t('workflow_publish_not_testrun_title')}
      description={I18n.t('workflow_publish_not_testrun_content')}
      mainButtonText={I18n.t('workflow_publish_not_testrun_ insist')}
      onCancel={onCancel}
      onOpenTestRun={onTestRun}
      onForcePush={() => {
        onCancel();
        onPublish();
      }}
    >
      <div>
        <BasePublishButton onPublish={handlePublish} {...props} />
      </div>
    </ForcePushPopover>
  );
};
