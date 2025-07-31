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
