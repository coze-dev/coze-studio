import React, { useEffect } from 'react';

import { useWorkflowPlayground } from '@/use-workflow-playground';

export const TemplatePreviewInner = ({ spaceId, workflowId }) => {
  const { workflowComp, init: initWorkflow } = useWorkflowPlayground({
    from: 'workflowTemplate',
  });

  useEffect(() => {
    initWorkflow({
      spaceId,
      workflowId,
      showExecuteResult: false,
      enableInitTestRunInput: false,
      disabledSingleNodeTest: true,
      disableTraceAndTestRun: true,
      disableGetTestCase: true,
    });
  }, [workflowId, spaceId]);

  return <>{workflowComp}</>;
};
