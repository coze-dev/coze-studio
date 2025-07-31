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
