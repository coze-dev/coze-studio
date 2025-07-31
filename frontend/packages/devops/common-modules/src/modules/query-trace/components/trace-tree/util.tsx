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

import { type ReactNode } from 'react';

import classNames from 'classnames';
import { I18n } from '@coze-arch/i18n';
import { IconCozFocus } from '@coze-arch/coze-design/icons';
import { Button } from '@coze-arch/coze-design';
import { Tooltip } from '@coze-arch/bot-semi';
import { IconpanNodeDamaged } from '@coze-arch/bot-icons';
import {
  SpanCategory,
  SpanStatus,
  SpanType,
} from '@coze-arch/bot-api/ob_query_api';

import { type TreeNode, type TreeNodeExtra } from '../tree';
import {
  buildTraceTree,
  getSpanTitle,
  type SpanNode,
} from '../../utils/cspan-graph';
import { getTokens, getSpanProp } from '../../utils/cspan';
import { type CSpan } from '../../typings/cspan';
import { type SpanTypeConfigMap } from '../../typings/config';
import { rootBreakSpanId } from '../../constant';
import { type WorkflowJumpParams, type SpanDetail } from './typing';
import { spanStatusConfig, spanCategoryConfig } from './config';

import styles from './index.module.less';

const genTitleRender = ({
  spanTypeConfigMap,
  spanInfoMap,
  spaceId,
  onHoverChange,
  onJumpToWorkflow,
}: {
  spanTypeConfigMap?: SpanTypeConfigMap;
  spanInfoMap?: Record<string, SpanDetail | undefined>;
  spaceId?: string;
  onHoverChange?: (key: string) => void;
  onJumpToWorkflow?: (params: WorkflowJumpParams) => void;
}) => {
  const titleRender = (nodeData: TreeNodeExtra): ReactNode => {
    const { selected, unindented, hover, key } = nodeData;
    const { span } = nodeData?.extra as { span: CSpan };
    const { status, latency, category = SpanCategory.Unknown } = span;
    const title = getSpanTitle(span, spanTypeConfigMap);

    const isCozeWorkflow =
      spanInfoMap?.[span.id]?.isCozeWorkflowNode &&
      Boolean(getSpanProp(span, 'workflow_id')) &&
      spaceId;
    const workflowID = getSpanProp(span, 'workflow_id') as string;
    const workflowVersion =
      getSpanProp(span, 'workflow_version')?.toString() ||
      spanInfoMap?.[span.id]?.workflowVersion;

    const handleJumpToWorkflow = () => {
      const executeID = getSpanProp(span, 'execute_id') as string | undefined;
      const workflowNodeID = getSpanProp(span, 'workflow_node_id')?.toString();
      const subExecuteID = getSpanProp(span, 'sub_execute_id')?.toString();

      onJumpToWorkflow?.({
        workflowID,
        executeID,
        workflowVersion,
        workflowNodeID,
        subExecuteID,
      });
    };

    const { input_tokens: inputTokens, output_tokens: outputTokens } =
      getTokens(span);
    let content = '';

    if (inputTokens !== undefined && outputTokens !== undefined) {
      const tokensStr = inputTokens + outputTokens;
      content = `${I18n.t('analytic_query_latency')}: ${latency}ms | ${I18n.t(
        'analytic_query_tokens',
      )}: ${tokensStr}`;
    } else {
      content = `${I18n.t('analytic_query_latency')}: ${latency}ms`;
    }
    const config = spanCategoryConfig[category];

    // Virtual broken root node
    if (span.id === rootBreakSpanId) {
      return (
        <div
          className={classNames(styles['trace-tree-node'], {
            selected: false,
            unindented,
            hover,
            error: status === SpanStatus.Error,
            disabled: true,
          })}
        >
          <IconpanNodeDamaged />
        </div>
      );
    } else {
      return (
        <>
          <Tooltip position="right" content={content} trigger="hover">
            <div
              className={classNames(styles['trace-tree-node'], {
                selected,
                unindented,
                hover,
                error: status === SpanStatus.Error,
              })}
              onMouseEnter={() => onHoverChange?.(key)}
              onMouseLeave={() => onHoverChange?.('')}
            >
              {config?.icon}
              <span className={styles.title}>{title}</span>
            </div>
          </Tooltip>
          {isCozeWorkflow &&
          workflowID !== undefined &&
          workflowVersion !== undefined ? (
            <Tooltip position="top" content={I18n.t('view_workflow_details')}>
              <Button
                icon={<IconCozFocus />}
                style={{ width: 16, height: 16, marginLeft: 4 }}
                color="secondary"
                size="mini"
                onClick={e => {
                  e.stopPropagation();
                  handleJumpToWorkflow();
                }}
              />
            </Tooltip>
          ) : null}
        </>
      );
    }
  };
  return titleRender;
};

export const spanData2treeData = (
  spanData: CSpan[],
  spanTypeConfigMap?: SpanTypeConfigMap,
  options?: {
    spaceId?: string;
    onHoverChange?: (key: string) => void;
    onJumpToWorkflow?: (params: WorkflowJumpParams) => void;
  },
): TreeNode | undefined => {
  const traceTree = buildTraceTree(spanData);
  const spanInfoMap = getSpanInfoMap(traceTree);

  const walk = (span: SpanNode): TreeNode => {
    const lineStyle = spanStatusConfig[span.status]?.lineStyle;

    let treeNode: TreeNode = {
      key: span.id,
      title: genTitleRender({ spanTypeConfigMap, spanInfoMap, ...options }),
      selectEnabled: true,
      indentDisabled: false,
      lineStyle,
      zIndex: span.status === SpanStatus.Error ? 1 : 0,
      extra: {
        span,
      },
    };
    // breakSpan node
    if (span.id === rootBreakSpanId) {
      treeNode = {
        ...treeNode,
        selectEnabled: false,
        indentDisabled: true,
      };
    }

    treeNode.children = span.children?.map(childSpan => walk(childSpan)) ?? [];

    return treeNode;
  };

  return walk(traceTree);
};

export const getSpanInfoMap = (root: SpanNode) => {
  const spanInfoMap: Record<string, SpanDetail | undefined> = {};

  const bfs = (node: SpanNode) => {
    // Coze workflow settings isCozeWorkflowNode
    if (
      node.type === SpanType.Workflow &&
      getSpanProp(node, 'workflow_schema_type') === 1
    ) {
      const parentLevel = spanInfoMap[node.parent_id]?.workflowLevel || 0;
      spanInfoMap[node.id] = {
        isCozeWorkflowNode: true,
        workflowLevel: parentLevel + 1,
        workflowVersion:
          parentLevel <= 1
            ? getSpanProp(node, 'workflow_version')?.toString() ||
              spanInfoMap[node.parent_id]?.workflowVersion
            : undefined,
      };
    } else {
      // Coze workflow sub-node settings isCozeWorkflowNode
      const { isCozeWorkflowNode, workflowLevel = 0 } =
        spanInfoMap[node.parent_id] || {};

      if (isCozeWorkflowNode) {
        spanInfoMap[node.id] = {
          isCozeWorkflowNode: true,
          workflowLevel: workflowLevel + 1,
          workflowVersion:
            workflowLevel <= 1
              ? spanInfoMap[node.parent_id]?.workflowVersion
              : undefined,
        };
      }
    }

    // recursion
    for (const childNode of node.children || []) {
      bfs(childNode);
    }
  };

  bfs(root);

  return spanInfoMap;
};
