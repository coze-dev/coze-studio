import { useEffect } from 'react';

import { TraceDetailPanel as TraceDetailPanelNext } from '@coze-workflow/test-run-next';
import { type TraceFrontendSpan } from '@coze-workflow/base';

import { useFloatLayoutService, useTestRunReporterService } from '@/hooks';

import { PanelWrap } from '../../float-layout';
import { useGotoNode } from './use-goto-node';

export interface TraceDetailPanelProps {
  span: TraceFrontendSpan;
}

export const TraceDetailPanel: React.FC<TraceDetailPanelProps> = ({ span }) => {
  const floatLayoutService = useFloatLayoutService();
  const reporter = useTestRunReporterService();
  const { goto: gotoNode } = useGotoNode();
  const handleClose = () => {
    floatLayoutService.close('right');
  };

  useEffect(() => {
    reporter.traceOpen({ panel_type: 'detail', log_id: span.log_id });
  }, [reporter, span.log_id]);

  return (
    <PanelWrap layout="vertical">
      <TraceDetailPanelNext
        span={span}
        onClose={handleClose}
        onGotoNode={gotoNode}
      />
    </PanelWrap>
  );
};
