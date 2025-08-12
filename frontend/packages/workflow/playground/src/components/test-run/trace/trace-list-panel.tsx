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

import { useEffect } from 'react';

import { TraceListPanel as TraceListPanelNext } from '@coze-workflow/test-run-next';

import { useTemplateService } from '@/hooks/use-template-service';
import { useFloatLayoutService } from '@/hooks/use-float-layout-service';
import {
  useGlobalState,
  useFloatLayoutSize,
  useTestRunReporterService,
} from '@/hooks';

import { PanelWrap, PANEL_PADDING } from '../../float-layout';
import { useGotoNode } from './use-goto-node';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface TraceListPanelProps {}

export const TraceListPanel: React.FC<TraceListPanelProps> = () => {
  const floatLayoutService = useFloatLayoutService();
  const templateState = useTemplateService();
  const globalState = useGlobalState();
  const { height: layoutHeight } = useFloatLayoutSize();

  const { goto: gotoNode } = useGotoNode();
  const reporter = useTestRunReporterService();
  const handleClose = () => {
    floatLayoutService.close('bottom');
    if (templateState.templateVisible) {
      floatLayoutService.open('templatePanel', 'bottom');
    }
  };

  useEffect(() => {
    reporter.traceOpen({ panel_type: 'list' });
  }, [reporter]);

  return (
    <PanelWrap>
      <TraceListPanelNext
        spaceId={globalState.spaceId}
        workflowId={globalState.workflowId}
        maxHeight={layoutHeight - PANEL_PADDING * 2}
        onOpenDetail={span => {
          floatLayoutService.open('traceDetail', 'right', { span });
        }}
        onClose={handleClose}
        isInOp={IS_BOT_OP}
        onGotoNode={gotoNode}
      />
    </PanelWrap>
  );
};
