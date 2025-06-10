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
