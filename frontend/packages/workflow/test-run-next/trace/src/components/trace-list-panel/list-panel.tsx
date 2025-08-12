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
