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
 
import { useMemo } from 'react';

import {
  SpanType,
  type Span,
  type TraceAdvanceInfo,
  SpanStatus,
  SpanCategory,
} from '@coze-arch/bot-api/ob_query_api';

import { spans2CSpans } from '../utils/cspan-transform';
import {
  type SpanNode,
  buildCallTrees,
  getRootSpan,
} from '../utils/cspan-graph';
import { genVirtualStart, getSpanProp } from '../utils/cspan';
import {
  type SpanCategoryMeta,
  type CSpan,
  type CSpanAttrInvokeAgent,
  type CSPanBatch,
  type CTrace,
  type CSpanAttrUserInput,
} from '../typings/cspan';

// 对根节点追加traceAdvanceInfo信息
const appendTraceAdvanceInfo = (
  spans: CSpan[],
  traceAdvanceInfo?: Omit<TraceAdvanceInfo, 'trace_id'>,
): CSpan[] =>
  spans.map(span => {
    // 修改根节点的状态。 根节点的tokens和status以服务端获取的为准
    if (
      span.type === SpanType.UserInput ||
      span.type === SpanType.UserInputV2
    ) {
      const span0 = span as CSpanAttrUserInput;
      return {
        ...span0,
        status: traceAdvanceInfo?.status ?? SpanStatus.Unknown,
        input_tokens_sum: traceAdvanceInfo?.tokens.input,
        output_tokens_sum: traceAdvanceInfo?.tokens.output,
      };
    } else {
      return span;
    }
  });

interface TokensSum {
  input_tokens_sum: number;
  output_tokens_sum: number;
}
const appendSpans = (spans: CSpan[], callTrees: SpanNode[]) => {
  const tokensMap: {
    [spanId: string]: TokensSum | undefined;
  } = {};
  const calculateTokensSum = (span: SpanNode): TokensSum => {
    const { input_tokens: inputTokens, output_tokens: outputTokens } =
      getCSpanTokens(span);
    let inputTokensSumRst = inputTokens;
    let outputTokensSumRst = outputTokens;

    span.children?.forEach((subSpan: SpanNode) => {
      const subTokensSum = calculateTokensSum(subSpan);
      inputTokensSumRst += subTokensSum.input_tokens_sum;
      outputTokensSumRst += subTokensSum.output_tokens_sum;
      return span;
    });
    const tokensSum = {
      input_tokens_sum: inputTokensSumRst,
      output_tokens_sum: outputTokensSumRst,
    };
    tokensMap[span.id] = tokensSum;
    return tokensSum;
  };

  callTrees.forEach(callTree => {
    calculateTokensSum(callTree);
  });

  return spans.map(span => {
    if (
      span.type === SpanType.UserInput ||
      span.type === SpanType.UserInputV2
    ) {
      // 根节点input_tokens_sum和output_tokens_sum的数值以服务端获取为准，不做计算
      return span;
    } else {
      return {
        ...span,
        input_tokens_sum: tokensMap[span.id]?.input_tokens_sum,
        output_tokens_sum: tokensMap[span.id]?.output_tokens_sum,
      };
    }
  });
};

// 获取CSpan节点的tokens信息
const getCSpanTokens = (
  span: CSpan,
): {
  input_tokens: number;
  output_tokens: number;
} => {
  if ('spans' in span) {
    const spanBatch = span as CSPanBatch;
    let inputTokensRst = 0;
    let outputTokensRst = 0;
    spanBatch.spans.forEach(subSpan => {
      const inputTokens = subSpan?.extra?.input_tokens;
      const outputTokens = subSpan?.extra?.output_tokens;
      if (inputTokens !== undefined) {
        inputTokensRst += inputTokens;
      }
      if (outputTokens !== undefined) {
        outputTokensRst += outputTokens;
      }
    });
    return {
      input_tokens: inputTokensRst,
      output_tokens: outputTokensRst,
    };
  } else {
    // SingleSpan节点
    return {
      input_tokens: (getSpanProp(span, 'input_tokens') as number) ?? 0,
      output_tokens: (getSpanProp(span, 'output_tokens') as number) ?? 0,
    };
  }
};

// 追加invokeAgentInfo的dialog_round和model字段
const appendRootSpan = (info: { rootSpan: CSpan; spans: CSpan[] }): CTrace => {
  const { rootSpan, spans } = info;
  const rstSpan: CTrace = rootSpan;
  let { extra } = rstSpan;

  const invokeAgentSpans = spans.filter(
    span => span.type === SpanType.InvokeAgent,
  );
  if (invokeAgentSpans.length > 0) {
    const invokeAgentSpan = invokeAgentSpans[0] as CSpanAttrInvokeAgent;
    extra = {
      ...extra,
      dialog_round: invokeAgentSpan.extra?.dialog_round,
      model: invokeAgentSpan.extra?.model,
    };
  }

  return {
    ...rstSpan,
    extra,
  };
};

interface UseSpanTransformProps {
  orgSpans: Span[];
  traceAdvanceInfo?: Omit<TraceAdvanceInfo, 'trace_id'>;
  spanCategoryMeta?: SpanCategoryMeta;
  messageId?: string;
}
interface UseSpanTransformReturn {
  rootSpan: CTrace;
  spans: CSpan[];
}

// start节点不存在时，生成虚拟start节点
export const appendVirtualStart = (spans: CSpan[]): CSpan[] => {
  const startSpans = spans.filter(rootSpan => {
    const { category } = rootSpan;
    return category === SpanCategory.Start;
  });

  // 生成虚拟span
  if (startSpans.length > 0) {
    return spans;
  } else {
    const virtualStartSpan = genVirtualStart(spans);
    return spans.concat(virtualStartSpan);
  }
};

export const useSpanTransform = (
  props: UseSpanTransformProps,
): UseSpanTransformReturn => {
  const { orgSpans, traceAdvanceInfo, spanCategoryMeta, messageId } = props;

  const rst = useMemo(() => {
    let spans = spans2CSpans(orgSpans, spanCategoryMeta);
    // 追加虚拟span
    spans = appendVirtualStart(spans);

    // 追加traceAdvanceInfo信息
    spans = appendTraceAdvanceInfo(spans, traceAdvanceInfo);

    // 根据spans，组装call trees
    let callTrees = buildCallTrees(spans);
    // 根节点超过 1 个，需要按 message id 过滤
    if (callTrees.length > 1 && messageId) {
      callTrees = callTrees.filter(
        root =>
          !('extra' in root) ||
          (root.extra && !('message_id' in root.extra)) ||
          // 存在 message_id 的情况下，过滤 id 匹配的节点
          root.extra?.message_id === messageId,
      );
    }
    const rootSpan = getRootSpan(callTrees, false);

    // rootSpan的根节点调整: 追加invokeAgent信息
    const rootSpanRst = appendRootSpan({
      rootSpan,
      spans,
    });

    const visit = (targetId: string, root: SpanNode): boolean => {
      if (root.id === targetId) {
        return true;
      }
      return root.children?.some(subRoot => visit(targetId, subRoot)) ?? false;
    };

    // 过滤掉不在rootSpan中的节点
    spans = spans.filter(span => visit(span.id, rootSpan));

    // 对spans节点进行调整: spans中workflow节点tokens累加计算
    const spansRst = appendSpans(spans, callTrees);
    return {
      rootSpan: rootSpanRst,
      spans: spansRst,
    };
  }, [orgSpans, traceAdvanceInfo, spanCategoryMeta, messageId]);

  return rst;
};
