import React from 'react';

import { BottomPanel } from '@coze-workflow/test-run-shared';
import { type TraceFrontendSpan } from '@coze-arch/bot-api/workflow_api';

import { TraceGraph } from '../trace-graph';
import { type GotoParams } from '../../types';
import { TraceListProvider } from '../../contexts';
import { TraceListPanelHeader } from './header';

interface TraceListPanelProps {
  spaceId: string;
  workflowId: string;
  maxHeight: number;
  isInOp?: boolean;
  onOpenDetail: (span: TraceFrontendSpan) => void;
  onClose: () => void;
  onGotoNode: (params: GotoParams) => void;
}

export const TraceListPanel: React.FC<TraceListPanelProps> = ({
  spaceId,
  workflowId,
  isInOp,
  maxHeight,
  onOpenDetail,
  onGotoNode,
  onClose,
}) => (
  <TraceListProvider spaceId={spaceId} workflowId={workflowId} isInOp={isInOp}>
    <BottomPanel
      header={<TraceListPanelHeader />}
      height={300}
      resizable={{
        min: 300,
        max: maxHeight,
      }}
      onClose={onClose}
    >
      <TraceGraph onOpenDetail={onOpenDetail} onGotoNode={onGotoNode} />
    </BottomPanel>
  </TraceListProvider>
);
