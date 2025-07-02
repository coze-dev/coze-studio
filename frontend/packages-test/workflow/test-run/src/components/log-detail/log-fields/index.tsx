import React, { useMemo } from 'react';

import { type FlowNodeEntity } from '@flowgram-adapter/free-layout-editor';
import { type NodeResult } from '@coze-workflow/base/api';

import { type WorkflowLinkLogData } from '../../../types';
import { generateLog } from '../../../features/log';
import { LogField } from './log-field';
import { EmptyFiled } from './empty';

interface LogFieldsProps {
  data: NodeResult | undefined;
  node?: FlowNodeEntity;
  onPreview: (value: string, path: string[]) => void;
  onOpenWorkflowLink?: (data: WorkflowLinkLogData) => void;
}

export const LogFields: React.FC<LogFieldsProps> = ({
  data,
  node,
  onPreview,
  onOpenWorkflowLink,
}) => {
  const { nodeStatus } = data || {};
  const { logs } = useMemo(() => generateLog(data, node), [data, node]);

  if (!data) {
    return <EmptyFiled />;
  }

  return (
    <>
      {logs.map((log, idx) => (
        <LogField
          key={idx}
          log={log}
          node={node}
          nodeStatus={nodeStatus}
          onPreview={onPreview}
          onOpenWorkflowLink={onOpenWorkflowLink}
        />
      ))}
    </>
  );
};
