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

import { useState } from 'react';

import { I18n } from '@coze-arch/i18n';
import { Toast } from '@coze-arch/coze-design';
import { type PublishWorkflowRequest } from '@coze-arch/bot-api/workflow_api';

import { useGlobalState, useWorkflowOperation } from '@/hooks';

import { useIsPublishDisabled } from './use-is-publish-disabled';
import { TooltipWithDisabled } from './tooltip-with-disabled';
import { PublishWithEnv } from './publish-with-env';

export const PublishButton = () => {
  const globalState = useGlobalState();
  const { playgroundProps } = globalState;
  const operation = useWorkflowOperation();
  const { disabled, tooltip } = useIsPublishDisabled();

  /**
   * Since there are various pop-ups and floating layers around the publish button in the product form, a centralized markup is set to prevent conflicts with each other
   * This is not a good practice. The product form of the release button should be optimized in the future. It is too cumbersome to release now.
   */
  const [step, setStep] = useState('none');

  const handlePublish = async (obj?: Partial<PublishWorkflowRequest>) => {
    const published = await operation.publish(obj);
    if (!published) {
      return published;
    }

    Toast.success({
      content: I18n.t('workflow_detail_title_publish_toast'),
      duration: 1.5,
    });

    playgroundProps.onPublish?.(globalState);
    return published;
  };

  if (globalState.readonly) {
    return null;
  }

  return (
    <TooltipWithDisabled content={tooltip} disabled={!disabled || !tooltip}>
      <div>
        <PublishWithEnv
          step={step}
          setStep={setStep}
          disabled={disabled}
          onPublish={handlePublish}
        />
      </div>
    </TooltipWithDisabled>
  );
};
