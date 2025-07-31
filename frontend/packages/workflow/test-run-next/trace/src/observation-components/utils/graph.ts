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

import { uniqBy } from 'lodash-es';

import { type TraceFrontendSpan } from '../typings/idl';
import {
  type SpanNode,
  type RenderGraphNodeConfig,
  type SpanNodeRenderOptions,
} from '../typings/graph';
import { renderCustomTreeNode } from '../trace-tree/graph-render';
import {
  FLAME_THREAD_DEFAULT_RECT_STYLE,
  SPAN_STATUS_CONFIG,
} from '../consts/graph';
import { NODE_PRESET_CONFIG_MAP, type PresetSpanType } from '../consts/graph';
import { StatusCode } from '../consts/basic';
import { type TreeNodeInfo } from '../common/tree/typing';
import { type TreeNode } from '../common/tree';
import { type RectStyle, type RectNode } from '../common/flamethread';
import { getStandardStatusCode } from './basic';

export function spans2SpanNodes(spans: TraceFrontendSpan[]): {
  roots: SpanNode[];
  spans: TraceFrontendSpan[];
} {
  if (spans.length === 0) {
    return {
      roots: [],
      spans: [],
    };
  }

  const roots: SpanNode[] = [];
  const map: Record<string, SpanNode> = {};

  const sortedSpans = uniqBy(spans, span => span.span_id).sort((a, b) => {
    const startA = a.start_time ? Number(a.start_time) : Infinity;
    const startB = b.start_time ? Number(b.start_time) : Infinity;
    return startA - startB;
  });

  sortedSpans.forEach(span => {
    const currentSpan: SpanNode = {
      ...span,
      children: [],
    };
    const { span_id } = span;
    if (span_id) {
      map[span_id] = currentSpan;
    }
  });

  sortedSpans.forEach(span => {
    const { span_id, parent_id } = span;
    if (span_id) {
      const spanNode = map[span_id];
      const parentSpanNode = parent_id ? map[parent_id] : undefined;
      if (parentSpanNode === undefined) {
        roots.push({
          ...spanNode,
          isBroken: parent_id !== '0',
        });
      } else {
        parentSpanNode.children = parentSpanNode.children ?? [];
        parentSpanNode.children.push(spanNode);
      }
    }
  });

  return {
    roots,
    spans: sortedSpans,
  };
}

export const getSpanNodeInfo = (
  spanNode: SpanNode,
  map: Record<string, TreeNodeInfo> = {},
) => {
  const { isKeyNode, keyNodeParentId } = map[spanNode.parent_id || ''] || {};
  if (spanNode.span_id) {
    map[spanNode.span_id] = {
      isCollapsed: false,
      isKeyNode: spanNode.is_key_span,
      keyNodeParentId: isKeyNode ? spanNode.parent_id : keyNodeParentId,
    };
  }

  spanNode.children?.forEach(childSpan => getSpanNodeInfo(childSpan, map));
};

export const geSpanNodeInfoMap = (spanNodes: SpanNode[]) => {
  const map: Record<string, TreeNodeInfo> = {};
  spanNodes.map(spanNode => getSpanNodeInfo(spanNode, map));
  return map;
};

export const spanNode2TreeNode = (
  spanNodes: SpanNode[],
  map: Record<string, TreeNodeInfo> = {},
  options: SpanNodeRenderOptions = {},
): TreeNode[] => {
  const { showKeyNodeOnly } = options;
  return (
    spanNodes
      .map(spanNode => {
        const { status_code = StatusCode.SUCCESS } = spanNode;
        const lineStyle =
          SPAN_STATUS_CONFIG[getStandardStatusCode(status_code)]?.lineStyle;

        const treeNode: TreeNode = {
          key: spanNode.span_id || '',
          title: renderCustomTreeNode(options),
          lineStyle,
          zIndex: spanNode.status_code === StatusCode.ERROR ? 1 : 0,
          extra: {
            spanNode,
          },
        };

        const { isCollapsed, isKeyNode } = map[treeNode.key] || {};

        if (showKeyNodeOnly && !isKeyNode) {
          return (
            spanNode2TreeNode(spanNode.children || [], map, options).flat() ??
            []
          );
        }

        if (!isCollapsed) {
          treeNode.children =
            spanNode2TreeNode(spanNode.children || [], map, options).flat() ??
            [];
        }
        return treeNode;
      })
      .flat() || []
  );
};

const genRectStyle = (
  span: SpanNode,
  customTypeConfigMap?: RenderGraphNodeConfig['customTypeConfigMap'],
): RectStyle => {
  const { type = '' } = span;

  const rectStyle =
    customTypeConfigMap?.[type]?.flamethread?.rectStyle ??
    NODE_PRESET_CONFIG_MAP[type as PresetSpanType]?.flamethread?.rectStyle ??
    FLAME_THREAD_DEFAULT_RECT_STYLE;

  return {
    normal: rectStyle?.normal,
    hover: rectStyle?.hover,
    select: rectStyle?.select,
  };
};

const genRectNode = (info: {
  span: TraceFrontendSpan;
  startSpan?: TraceFrontendSpan;
  rowNo: number;
  customTypeConfigMap?: RenderGraphNodeConfig['customTypeConfigMap'];
}): RectNode => {
  const { span, startSpan, rowNo, customTypeConfigMap } = info;
  const start =
    (span.start_time as number) -
    (startSpan ? (startSpan.start_time as number) : 0);
  const end = start + (span.duration as number);
  return {
    key: span.span_id ?? '',
    rowNo,
    start,
    end,
    rectStyle: genRectStyle(span, customTypeConfigMap),
    extra: {
      span,
    },
  };
};

export const spanData2flamethreadData = (
  spans: TraceFrontendSpan[],
  customTypeConfigMap?: RenderGraphNodeConfig['customTypeConfigMap'],
): RectNode[] => {
  const startSpan = spans?.[0] as TraceFrontendSpan | undefined;
  return spans.map((span, index) =>
    genRectNode({
      span,
      startSpan,
      rowNo: index,
      customTypeConfigMap,
    }),
  );
};
