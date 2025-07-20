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
 
import { sortBy } from 'lodash-es';
import { SpanCategory } from '@coze-arch/bot-api/ob_query_api';

import { type RectNode, type RectStyle } from '../flamethread';
import {
  buildCallTrees,
  getBreakSpans,
  getRootSpan,
  type SpanNode,
} from '../../utils/cspan-graph';
import { isVisibleSpan } from '../../utils/cspan';
import { type CSpan } from '../../typings/cspan';
import { spanCategoryConfig, spanStatusConfig } from './config';

const genRectStyle = (span: CSpan): RectStyle => {
  const { status, category = SpanCategory.Unknown } = span;
  const categoryRectStyle = spanCategoryConfig[category]?.rectStyle;
  const statusRectStyle = spanStatusConfig[status]?.rectStyle;

  return {
    normal: Object.assign(
      {},
      categoryRectStyle?.normal,
      statusRectStyle?.normal,
    ),
    hover: Object.assign({}, categoryRectStyle?.hover, statusRectStyle?.hover),
    select: Object.assign(
      {},
      categoryRectStyle?.select,
      statusRectStyle?.select,
    ),
  };
};

const genRectNode = (info: {
  span: CSpan;
  startSpan: CSpan;
  rowNo: number;
}): RectNode => {
  const { span, startSpan, rowNo } = info;
  const start = span.start_time - startSpan.start_time;
  return {
    key: span.id,
    rowNo,
    start,
    end: start + span.latency,
    rectStyle: genRectStyle(span),
    extra: {
      span,
    },
  };
};

export const spanData2flamethreadData = (spanData: CSpan[]): RectNode[] => {
  // 1. 根据spans，组装call trees
  const callTrees = buildCallTrees(spanData);

  // 2. 生成tartSpan
  const startSpan: SpanNode = getRootSpan(callTrees, false);

  // 3. 获取 break节点(非start的根节点都是breakSpan)
  const breakSpans: SpanNode[] = getBreakSpans(callTrees, false);

  let rstSpans: SpanNode[] = [];

  // 前序搜索，确保父节点在前
  const walk = (spans: SpanNode[]) => {
    rstSpans = rstSpans.concat(spans);
    spans.forEach(span => {
      if (span.children) {
        walk(span.children);
      }
    });
  };
  if (startSpan.children) {
    walk(startSpan.children);
  }
  walk(breakSpans);

  // 过滤掉不显示的span节点
  rstSpans = rstSpans.filter(span => isVisibleSpan(span));

  // 按start_time稳定排序
  const sortedSpans = sortBy(rstSpans, o => o.start_time);

  // 添加跟节点
  sortedSpans.unshift(startSpan);

  const rectNodes: RectNode[] = [];
  sortedSpans.forEach((span, index) => {
    rectNodes.push(genRectNode({ span, startSpan, rowNo: index }));
  });

  return rectNodes;
};
