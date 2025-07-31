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

import { useMemo, useState } from 'react';

import { clsx } from 'clsx';
import { gotoDebugFlow } from '@coze-workflow/test-run-shared';
import { I18n } from '@coze-arch/i18n';
import {
  type Span,
  type TraceFrontendSpan,
} from '@coze-arch/bot-api/workflow_api';
import { IconCozExit } from '@coze-arch/coze-design/icons';
import { Typography, Select, IconButton } from '@coze-arch/coze-design';

import { FocusButton } from '../focus-button';
import { getGotoNodeParams } from '../../utils';
import { type GotoParams } from '../../types';
import {
  TraceTree,
  TraceFlameThread,
  spans2SpanNodes,
} from '../../observation-components';
import { useTraceListStore } from '../../contexts';
import { TraceChartsMode } from '../../constants';
import { useTrace } from './use-trace';
import { EmptyTemplate, LoadingTemplate } from './template';
import { TraceTable } from './table';

import css from './graph.module.less';

interface TraceGraphProps {
  onOpenDetail: (span: TraceFrontendSpan) => void;
  onGotoNode: (params: GotoParams) => void;
}

const MODE_OPTIONS = [
  {
    label: I18n.t('analytic_query_detail_left_panel_flamethread'),
    value: TraceChartsMode.FlameThread,
  },
  {
    label: I18n.t('Starling_filebox_api_list'),
    value: TraceChartsMode.Table,
  },
];

export const TraceGraph: React.FC<TraceGraphProps> = ({
  onOpenDetail,
  onGotoNode,
}) => {
  const [mode, setMode] = useState(TraceChartsMode.FlameThread);
  const { ready, spaceId, isInOp } = useTraceListStore(store => ({
    ready: store.ready,
    spaceId: store.spaceId,
    isInOp: store.isInOp,
  }));
  const { spans, loading } = useTrace();

  const tree = useMemo(() => spans2SpanNodes(spans || ([] as any)), [spans]);

  const handleFocusNode = (span: Span) => {
    onGotoNode(getGotoNodeParams(span));
  };

  const jumpToDebugFlow = (span: Span) => {
    const params = getGotoNodeParams(span);
    gotoDebugFlow(
      {
        ...params,
        spaceId,
      },
      isInOp,
    );
  };

  if (!ready || loading) {
    return <LoadingTemplate />;
  }

  if (!spans) {
    return <EmptyTemplate />;
  }

  return (
    <div className={css['trace-graph']}>
      <div className={clsx(css['graph-part'], css['part-tree'])}>
        <TraceTree
          spans={tree.roots}
          renderGraphNodeConfig={{
            traceTreeCustomRenderer: {
              renderExtra: span =>
                span.parent_id && span.parent_id !== '0' ? (
                  <FocusButton span={span} onClick={handleFocusNode} />
                ) : (
                  <IconButton
                    size="mini"
                    icon={<IconCozExit />}
                    onClick={e => {
                      e.stopPropagation();
                      jumpToDebugFlow(span);
                    }}
                  />
                ),
            },
          }}
          onSelect={v => {
            const span = (v.node.extra as any)?.spanNode;
            if (span) {
              onOpenDetail(span);
            }
          }}
        />
      </div>
      <div className={clsx(css['graph-part'], css['part-chart'])}>
        <div className={css['trace-charts']}>
          <div className={css['chart-header']}>
            <Typography.Text strong fontSize="16px">
              {I18n.t('store_bot_detail_title_mobile')}
            </Typography.Text>
            <Select
              size="small"
              className={css['mode-select']}
              optionList={MODE_OPTIONS}
              value={mode}
              onChange={(v: any) => setMode(v)}
            />
          </div>
          <div className={css['chart-content']}>
            {mode === TraceChartsMode.Table && <TraceTable spans={spans} />}
            {mode === TraceChartsMode.FlameThread && (
              <TraceFlameThread spans={spans} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
