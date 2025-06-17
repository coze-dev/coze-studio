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
   * 由于产品形态上围绕发布按钮有多种弹窗和浮层，为了防止彼此冲突设置一个集中的标记
   * 这不是一种很好的做法，未来应该优化发布按钮的产品形态，现在发布实在太繁琐
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
