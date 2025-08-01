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
