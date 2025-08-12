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

import { type NodeExeStatus } from '@coze-arch/bot-api/workflow_api';
import { type FlowNodeEntity } from '@flowgram-adapter/free-layout-editor';

import { type WorkflowLinkLogData } from '../../../types';
import {
  ConditionLogParser,
  OutputLogParser,
  NormalLogParser,
  isOutputLog,
  isConditionLog,
  FunctionCallLogParser,
  isFunctionCallLog,
  WorkflowLinkParser,
  isWorkflowLinkLog,
  type Log,
} from '../../../features/log';

export const LogField: React.FC<{
  log: Log;
  node?: FlowNodeEntity;
  nodeStatus?: NodeExeStatus;
  onPreview: (value: string, path: string[]) => void;
  onOpenWorkflowLink?: (data: WorkflowLinkLogData) => void;
}> = ({ log, node, nodeStatus, onPreview, onOpenWorkflowLink }) => {
  if (isConditionLog(log)) {
    return <ConditionLogParser log={log} />;
  }

  if (isFunctionCallLog(log)) {
    return <FunctionCallLogParser log={log} />;
  }

  if (isOutputLog(log)) {
    return (
      <OutputLogParser
        log={log}
        node={node}
        nodeStatus={nodeStatus}
        onPreview={onPreview}
      />
    );
  }

  if (isWorkflowLinkLog(log)) {
    return (
      <WorkflowLinkParser log={log} onOpenWorkflowLink={onOpenWorkflowLink} />
    );
  }

  return <NormalLogParser log={log} />;
};
