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

import {
  type EdgeProps,
  BaseEdge,
  getBezierPath,
  Position,
  EdgeLabelRenderer,
} from 'reactflow';
import { useMemo } from 'react';

import classNames from 'classnames';
import { I18n } from '@coze-arch/i18n';
import { Tooltip } from '@coze-arch/bot-semi';
import { SpanStatus } from '@coze-arch/bot-api/ob_query_api';

import { getTopologyItemStatus } from '../util';
import {
  type TopologicalBatchNodeExecutionInfo,
  type EdgeData,
} from '../typing';
import { TOPOLOGY_EDGE_STATUS_MAP } from '../constant';
import { type SpanNode } from '../../../utils/cspan-graph';
import { checkIsBatchBasicCSpan } from '../../../utils/cspan';
import { type CSPanBatch } from '../../../typings/cspan';

import s from './common.module.less';

const isVerticalEdge = (position: Position) =>
  position === Position.Top || position === Position.Bottom;

const getBatchNodeExecutionInfo = (
  spanNode?: SpanNode,
): TopologicalBatchNodeExecutionInfo => {
  const batchNodeExecutionInfo: TopologicalBatchNodeExecutionInfo = {
    isBatch: false,
    isError: false,
    errorNumber: 0,
    totalNumber: 0,
  };
  if (!spanNode || !checkIsBatchBasicCSpan(spanNode)) {
    return batchNodeExecutionInfo;
  }
  const { spans, status: batchNodeStatus } = spanNode as CSPanBatch;

  batchNodeExecutionInfo.isBatch = true;
  batchNodeExecutionInfo.isError = batchNodeStatus === SpanStatus.Error;

  spans.forEach(span => {
    const { status } = span;
    batchNodeExecutionInfo.totalNumber++;
    if (status === SpanStatus.Error) {
      batchNodeExecutionInfo.errorNumber++;
    }
  });

  return batchNodeExecutionInfo;
};

interface BatchEdgeInfoProps {
  batchNodeExecutionInfo: TopologicalBatchNodeExecutionInfo;
}

const BatchEdgeInfo = (props: BatchEdgeInfoProps) => {
  const { batchNodeExecutionInfo } = props;
  const { isError, totalNumber, errorNumber } = batchNodeExecutionInfo;
  return (
    <div
      className={classNames(
        s['batch-edge-info-container'],
        isError && s['batch-edge-info-container_error'],
      )}
    >
      {!isError || totalNumber === errorNumber ? (
        <>{totalNumber}</>
      ) : (
        <Tooltip
          content={I18n.t('analytic_query_detail_topology_tooltip', {
            errorCount: errorNumber,
            callCount: totalNumber,
          })}
        >
          {errorNumber}
          <span style={{ color: '#1D1C23' }}>
            <span style={{ margin: '0 3px' }}>/</span>
            {totalNumber}
          </span>
        </Tooltip>
      )}
    </div>
  );
};

export const CommonEdge = (props: EdgeProps<EdgeData>) => {
  const {
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    markerEnd,
    data,
  } = props;

  const batchNodeExecutionInfo = useMemo(
    () => getBatchNodeExecutionInfo(data?.tailDynamicSpanNode),
    [data?.tailDynamicSpanNode],
  );

  const topologyEdgeStatus = getTopologyItemStatus(data?.tailDynamicSpanNode);

  // When the vertical type line segment is laid out, the node position is used for positioning, so that the start and end points of the line segment are positioned at the beginning of the node
  const adaptedSourceX = isVerticalEdge(sourcePosition)
    ? data?.layoutInfo?.customSourceX ?? sourceX
    : sourceX;
  const adaptedTargetX = isVerticalEdge(targetPosition)
    ? data?.layoutInfo?.customTargetX ?? targetX
    : targetX;

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX: adaptedSourceX,
    sourceY,
    targetX: adaptedTargetX,
    targetY,
    sourcePosition,
    targetPosition,
  });

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          strokeWidth: 2,
          stroke: TOPOLOGY_EDGE_STATUS_MAP[topologyEdgeStatus].edgeColor,
        }}
      />
      {batchNodeExecutionInfo.isBatch && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
              pointerEvents: 'all',
            }}
          >
            <BatchEdgeInfo batchNodeExecutionInfo={batchNodeExecutionInfo} />
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
};
