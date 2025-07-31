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

import { generateAuth } from '../utils/generate-auth';
import { useExecStateEntity } from '../../../hooks';
import { type NodeError } from '../../../entities/workflow-exec-state-entity';

const transformNodeError = (nodeErrors?: NodeError[]) => {
  if (!nodeErrors) {
    return;
  }
  const error = nodeErrors.find(item => item.errorLevel === 'error');
  const warning = nodeErrors.find(item => item.errorLevel === 'warning');
  const pending = nodeErrors.find(item => item.errorLevel === 'pending');

  return error || warning || pending;
};

export const useStatus = (nodeId: string) => {
  const execEntity = useExecStateEntity();
  const { projectId: runProjectId } = execEntity.config;

  const executeResult = execEntity.getNodeExecResult(nodeId);
  const { nodeStatus, nodeExeCost, tokenAndCost } = executeResult || {};

  const { needAuth, authLink } = generateAuth(executeResult);

  const handleAuth = () => {
    const features =
      'toolbar=no, location=no, status=no, menubar=no, scrollbars=yes, resizable=yes, width=480, height=630';
    window.open(authLink, 'targetWindow', features);
  };

  const nodeError = execEntity.getNodeError(nodeId);

  const { errorLevel, errorInfo } = transformNodeError(nodeError) || {};

  return {
    nodeStatus,
    hasExecuteResult: !!executeResult,
    nodeExeCost,
    tokenAndCost,
    errorLevel,
    errorInfo,
    needAuth,
    handleAuth,
    runProjectId,
    isSingleMode: execEntity.config.isSingleMode,
  };
};
