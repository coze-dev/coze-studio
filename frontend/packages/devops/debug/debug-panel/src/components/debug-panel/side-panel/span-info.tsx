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
  useSpanTransform,
  type CSpan,
} from '@coze-devops/common-modules/query-trace';
import { Divider } from '@coze-arch/bot-semi';
import {
  type TraceAdvanceInfo,
  type Span,
  SpanStatus,
} from '@coze-arch/bot-api/ob_query_api';

import { PanelDetail } from '../detail';
import { PanelChart } from '../chart';
import { type TargetOverallSpanInfo } from '../../../typings';
import { type SpanCategory } from '../../../store';

import s from './index.module.less';

interface SpanInfoAreaProps {
  botId: string;
  spaceId: string;
  targetDetailSpan?: CSpan;
  orgDetailSpans?: Span[];
  spanCategory?: SpanCategory;
  targetOverallSpanInfo?: TargetOverallSpanInfo;
  curBatchPage?: number;
  setTargetDetailSpan: (targetDetailSpan: CSpan) => void;
  setCurBatchPage: (curBatchPage: number) => void;
}

export const SpanInfoArea = (props: SpanInfoAreaProps) => {
  const {
    botId,
    spaceId,
    targetDetailSpan,
    orgDetailSpans,
    spanCategory,
    targetOverallSpanInfo,
    curBatchPage,
    setTargetDetailSpan,
    setCurBatchPage,
  } = props;

  const {
    status = SpanStatus.Unknown,
    input_tokens_sum = 0,
    output_tokens_sum = 0,
  } = targetOverallSpanInfo?.span ?? {};

  const traceAdvanceInfo: Omit<TraceAdvanceInfo, 'trace_id'> = useMemo(
    () => ({
      tokens: {
        input: input_tokens_sum,
        output: output_tokens_sum,
      },
      status,
    }),
    [input_tokens_sum, output_tokens_sum, status],
  );

  const { rootSpan, spans } = useSpanTransform({
    orgSpans: orgDetailSpans ?? [],
    traceAdvanceInfo,
    // @ts-expect-error fix me late
    spanCategoryMeta: spanCategory,
  });

  return (
    <>
      <div className={s['side-debug-panel-container-scroll-box-chat']}>
        {orgDetailSpans && spanCategory && targetOverallSpanInfo ? (
          <PanelChart
            rootSpan={rootSpan}
            spans={spans}
            targetDetailSpan={targetDetailSpan}
            onTargetDetailSpanChange={detailSpan => {
              setCurBatchPage(1);
              setTargetDetailSpan(detailSpan);
            }}
          />
        ) : null}
      </div>

      <Divider className={s['side-debug-panel-divider']} />
      <div className={s['side-debug-panel-container-scroll-box-detail']}>
        {targetDetailSpan && curBatchPage ? (
          <PanelDetail
            botId={botId}
            spaceId={spaceId}
            spans={spans}
            targetDetailSpan={targetDetailSpan}
            curBatchPage={curBatchPage}
            setCurBatchPage={setCurBatchPage}
          />
        ) : null}
      </div>
    </>
  );
};
