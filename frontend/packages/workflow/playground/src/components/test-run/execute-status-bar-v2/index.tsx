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

/**
 * Node status bar for coze graph 2.0
 */
import React from 'react';

import { WorkflowExecStatus, NodeExeStatus } from '@coze-workflow/base';
import { getNodeError } from '@flowgram-adapter/free-layout-editor';
import type { FlowNodeEntity } from '@flowgram-adapter/free-layout-editor';

import { useExecStateEntity, useGlobalState } from '../../../hooks';
import { ExecuteStatusBarContent } from './content';

interface ExecuteStatusBarV2Props {
  node: FlowNodeEntity;
}

const ExecuteStatusBarV2: React.FC<ExecuteStatusBarV2Props> = props => {
  const { node } = props;

  const execEntity = useExecStateEntity();
  const globalState = useGlobalState();

  // Workflow related
  const { viewStatus } = globalState;
  const executeNodeResult = execEntity.getNodeExecResult(node.id);

  // node correlation
  const { nodeStatus } = executeNodeResult || {};
  // Node 4 states
  const isNodeWaiting = nodeStatus === NodeExeStatus.Waiting;
  // Determine whether to display this component.
  // When a workflow is running or running, and there is a running result, and the node is not waiting
  const showStatusBar =
    (viewStatus === WorkflowExecStatus.EXECUTING ||
      viewStatus === WorkflowExecStatus.DONE) &&
    Boolean(executeNodeResult) &&
    !isNodeWaiting;

  const isInvalidNode = getNodeError(node);
  /**
   * 1. Invalid node does not display status bar
   * 2. Do not display status bar when display conditions are not met
   */
  if (isInvalidNode || !showStatusBar) {
    return null;
  }

  return <ExecuteStatusBarContent {...props} />;
};

export { ExecuteStatusBarV2 };
