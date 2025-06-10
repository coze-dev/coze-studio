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
