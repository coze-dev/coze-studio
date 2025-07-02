import React, { useState } from 'react';

import { useEntity } from '@flowgram-adapter/free-layout-editor';
import { BaseTestButton } from '@coze-workflow/test-run';
import { I18n } from '@coze-arch/i18n';
import { type ButtonProps } from '@coze-arch/coze-design';

import { useTestRunReporterService, useGlobalState } from '@/hooks';

import { useTestRunFlowV2 } from '../hooks/use-test-run-flow-v2';

type StartTestRunButtonProps = Pick<ButtonProps, 'size'>;

import { WorkflowTestFormStateEntity } from '../../../entities';

export const StartTestRunButton: React.FC<StartTestRunButtonProps> = props => {
  const [loading, setLoading] = useState(false);
  const testFormState = useEntity<WorkflowTestFormStateEntity>(
    WorkflowTestFormStateEntity,
  );
  const {
    config: { frozen },
  } = testFormState;
  const { projectId, projectCommitVersion } = useGlobalState();

  const disabled = !!frozen || loading || !!(projectId && projectCommitVersion);
  const testRunReporterService = useTestRunReporterService();
  const { testRunFlow } = useTestRunFlowV2();

  return (
    <BaseTestButton
      disabled={disabled}
      onClick={async () => {
        testRunReporterService.tryStart({
          scene: 'toolbar',
        });
        try {
          setLoading(true);
          await testRunFlow();
        } finally {
          setLoading(false);
        }
      }}
      {...props}
    >
      {I18n.t('workflow_detail_title_testrun')}
    </BaseTestButton>
  );
};
