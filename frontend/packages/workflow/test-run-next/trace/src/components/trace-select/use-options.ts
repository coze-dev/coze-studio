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

/* eslint-disable complexity */
import { useCallback, useEffect, useRef, useState } from 'react';

import dayjs from 'dayjs';
import { useMemoizedFn } from 'ahooks';
import { workflowApi } from '@coze-workflow/base';
import { SpanStatus, type Span } from '@coze-arch/bot-api/workflow_api';

import { useTraceListStore } from '../../contexts';
import { MAX_TRACE_LENGTH, MAX_TRACE_TIME } from '../../constants';

const getDefaultDate = (): [Date, Date] => {
  const end = dayjs().endOf('day').toDate();
  const start = dayjs()
    .subtract(MAX_TRACE_TIME - 1, 'day')
    .startOf('day')
    .toDate();

  return [start, end];
};

export const useOptions = (workflowId: string) => {
  const [date, setDate] = useState<[Date, Date]>(getDefaultDate());
  const [status, setStatus] = useState<SpanStatus>(SpanStatus.Unknown);
  const [options, setOptions] = useState<Span[]>([]);

  const optionsCacheRef = useRef(new Map<string, Span>());

  const { ready, span, patch } = useTraceListStore(store => ({
    span: store.span,
    ready: store.ready,
    patch: store.patch,
  }));

  const fetch = useMemoizedFn(async () => {
    const searchParams = new URLSearchParams(location.search);
    const executeMode = searchParams.get('execute_mode');
    const executeId = searchParams.get('execute_id');

    const { spans } = await workflowApi.ListRootSpans({
      workflow_id: workflowId,
      limit: MAX_TRACE_LENGTH,
      offset: 0,
      start_at: date[0].getTime(),
      end_at: date[1].getTime(),
      status: status === SpanStatus.Unknown ? undefined : status,
      execute_mode: executeMode ? Number(executeMode) : undefined,
    });
    const next = spans || [];
    let maybeInitialSpan = next[0];
    if (executeId && !ready && !span) {
      try {
        const { data } = await workflowApi.GetTraceSDK({
          execute_id: executeId,
          workflow_id: workflowId,
          start_at: date[0].getTime(),
          end_at: date[1].getTime(),
        });
        const first = data?.spans?.[0];
        if (first?.log_id) {
          maybeInitialSpan = first;
          const urlSpan = next.find(i => i.log_id === first.log_id);
          if (!urlSpan) {
            next.unshift(first);
          }
        }
        // eslint-disable-next-line @coze-arch/no-empty-catch -- no error required
      } catch {
        // No error required
      }
    }
    next.forEach(s => {
      if (s.log_id) {
        optionsCacheRef.current.set(s.log_id, s);
      }
    });
    setOptions(next);
    // If it is not initialized, it is initialized once
    if (!ready && !span && maybeInitialSpan) {
      patch({ span: maybeInitialSpan });
    }
    if (!ready) {
      patch({ ready: true });
    }
  });

  const handleDateChange = useCallback(
    (next: [Date, Date]) => {
      const [start, end] = next;
      // The date selected by the time selector is 0:00 on the day, which needs to be converted to 11:59:59 on the day.
      setDate([start, dayjs(end).endOf('day').toDate()] as [Date, Date]);
    },
    [setDate],
  );

  useEffect(() => {
    fetch();
  }, [date, status, fetch]);

  return {
    date,
    status,
    setStatus,
    options,
    optionsCacheRef,
    fetch,
    onDateChange: handleDateChange,
  };
};
