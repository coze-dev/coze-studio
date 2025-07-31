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

/* eslint-disable max-lines-per-function */
/* eslint-disable max-params */
/* eslint-disable @coze-arch/max-line-per-function */
import { useRef, useState } from 'react';

import { Resizable } from 're-resizable';
import qs from 'qs';
import { useAsyncEffect } from 'ahooks';
import { IllustrationNoResult } from '@douyinfe/semi-illustrations';
import { type CSpan } from '@coze-devops/common-modules/query-trace';
import { I18n } from '@coze-arch/i18n';
import { Divider, Empty, Spin } from '@coze-arch/bot-semi';
import { type SpanStatus, SpanType } from '@coze-arch/bot-api/ob_query_api';
import { obQueryApi } from '@coze-arch/bot-api';

import { PanelSummary } from '../summary';
import { QueryFilter } from '../query-filter';
import { PanelHeader } from '../header';
import { enhanceOriginalSpan, getSpanProp } from '../../../utils/span';
import { getDailyTimestampByDate } from '../../../utils';
import { DebugPanelLayout } from '../../../typings';
import { useDebugPanelStore } from '../../../store';
import { useDebugPanelLayoutConfig } from '../../../hooks/use-debug-panel-layout-config';
import { DEBUG_PANEL_LAYOUT_DEFAULT_TEMPLATE_INFO } from '../../../consts/static';
import {
  FILTERING_LIMIT,
  FILTERING_OPTION_ALL,
  INITIAL_OFFSET,
  TRACES_ADVANCE_INFO_TIME_BUFFER,
} from '../../../consts';
import { SpanInfoArea } from './span-info';

import s from './index.module.less';

export interface SideDebugPanelProps {
  onClose: () => void;
}

export const SideDebugPanel = (props: SideDebugPanelProps) => {
  const { onClose } = props;
  const [subAreaLoading, setSubAreaLoading] = useState(false);
  const [showLoadMore, setShowLoadMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const {
    basicInfo: { spaceID = '', botId = '' },
    isPanelShow,
    targetDateId,
    targetExecuteStatusId,
    targetOverallSpanInfo,
    enhancedOverallSpans,
    spanCategory,
    orgDetailSpans,
    targetDetailSpan,
    curBatchPage,
    entranceMessageLogId,
    setTargetOverallSpanInfo,
    onSelectDate,
    onSelectExecuteStatus,
    setEnhancedOverallSpans,
    setOrgDetailSpans,
    setSpanCategory,
    setTargetDetailSpan,
    setCurBatchPage,
  } = useDebugPanelStore();

  const queryOffsetRef = useRef(INITIAL_OFFSET);

  const [layoutConfig, setLayoutConfig] = useDebugPanelLayoutConfig();

  const handleFetchQuery = async (inputSearch?: string, loadMore?: boolean) => {
    if (!loadMore) {
      setShowLoadMore(false);
      queryOffsetRef.current = INITIAL_OFFSET;
    }
    const { data } = await obQueryApi.ListDebugQueries(
      {
        spaceID,
        botID: botId,
        status:
          targetExecuteStatusId === FILTERING_OPTION_ALL
            ? undefined
            : [targetExecuteStatusId as SpanStatus],
        inputSearch,
        limit: FILTERING_LIMIT,
        pageToken:
          queryOffsetRef.current === INITIAL_OFFSET
            ? undefined
            : queryOffsetRef.current,
        ...getDailyTimestampByDate(targetDateId),
      },
      {
        paramsSerializer: p => qs.stringify(p, { arrayFormat: 'comma' }),
      },
    );
    queryOffsetRef.current =
      data?.next_page_token && data.next_page_token !== ''
        ? data.next_page_token
        : INITIAL_OFFSET;
    const originSpans = data?.spans ?? [];
    setShowLoadMore(data?.has_more ?? false);

    if (originSpans.length === 0) {
      setEnhancedOverallSpans([]);
      return [];
    }
    const {
      data: { traces_advance_info: traceAdvanceInfo },
    } = await obQueryApi.BatchGetTracesAdvanceInfo({
      space_id: spaceID ?? '',
      bot_id: botId ?? '',
      traces: originSpans.map(item => {
        const { trace_id, start_time, latency } = item;
        return {
          trace_id,
          start_time,
          end_time: String(
            Number(start_time) +
              Number(latency) +
              TRACES_ADVANCE_INFO_TIME_BUFFER,
          ),
        };
      }),
    });
    const enhancedSpans = enhanceOriginalSpan(originSpans, traceAdvanceInfo);
    const spans = loadMore
      ? [...enhancedOverallSpans, ...enhancedSpans]
      : enhancedSpans;
    setEnhancedOverallSpans(spans);
    return spans;
  };

  const handleFetchQueryDetail = async (logId: string) => {
    const {
      data: { spans },
    } = await obQueryApi.GetTraceByLogID({
      space_id: spaceID,
      bot_id: botId,
      log_id: logId,
    });
    setOrgDetailSpans(spans);
    return spans;
  };

  const handleFetchTracesMetaInfo = async () => {
    const { data } = await obQueryApi.GetTracesMetaInfo();
    setSpanCategory(data?.span_category);
  };

  const selectQueryAuto = (span: CSpan) => {
    const logId = getSpanProp(span, 'log_id') as string;
    const input = getSpanProp(span, 'simple_input') as string;
    const output = getSpanProp(span, 'output') as string;
    setTargetOverallSpanInfo({
      value: logId,
      input,
      output,
      span,
    });
  };

  useAsyncEffect(async () => {
    if (targetOverallSpanInfo) {
      const { span } = targetOverallSpanInfo;
      const logId = getSpanProp(span, 'log_id') as string;
      setSubAreaLoading(true);
      try {
        await handleFetchQueryDetail(logId);
      } finally {
        setSubAreaLoading(false);
      }
    }
  }, [targetOverallSpanInfo]);

  useAsyncEffect(async () => {
    if (isPanelShow) {
      setLoading(true);
      onSelectDate(FILTERING_OPTION_ALL);
      onSelectExecuteStatus(FILTERING_OPTION_ALL);
      if (!spanCategory) {
        await handleFetchTracesMetaInfo();
      }
      // Enter from a message
      if (entranceMessageLogId) {
        try {
          const spans = await handleFetchQueryDetail(entranceMessageLogId);
          const userInputSpan = spans.find(
            item => item.type === SpanType.UserInput,
          );
          if (userInputSpan) {
            const { trace_id, start_time, latency } = userInputSpan;
            const {
              data: { traces_advance_info: traceAdvanceInfo },
            } = await obQueryApi.BatchGetTracesAdvanceInfo({
              space_id: spaceID,
              bot_id: botId,
              traces: [
                {
                  trace_id,
                  start_time,
                  end_time: String(
                    Number(start_time) +
                      Number(latency) +
                      TRACES_ADVANCE_INFO_TIME_BUFFER,
                  ),
                },
              ],
            });

            const userInputCSpan = enhanceOriginalSpan(
              [userInputSpan],
              traceAdvanceInfo,
            )?.[0];
            selectQueryAuto(userInputCSpan);
          }
        } finally {
          setLoading(false);
        }
      }
      //Direct entry
      else {
        try {
          const spans = await handleFetchQuery();
          const latestTrace = spans?.[0] as CSpan | undefined;
          if (latestTrace) {
            selectQueryAuto(latestTrace);
          }
        } finally {
          setLoading(false);
        }
      }
    }
  }, [isPanelShow, entranceMessageLogId]);

  return (
    <Resizable
      minWidth={
        DEBUG_PANEL_LAYOUT_DEFAULT_TEMPLATE_INFO.side[DebugPanelLayout.Overall]
          .width.min
      }
      maxWidth={
        DEBUG_PANEL_LAYOUT_DEFAULT_TEMPLATE_INFO.side[DebugPanelLayout.Overall]
          .width.max
      }
      enable={{
        left: true,
      }}
      defaultSize={{
        height: '100%',
        width: layoutConfig.side[DebugPanelLayout.Overall],
      }}
      onResizeStop={(e, d, el, delta) => {
        setLayoutConfig(config => {
          config.side[DebugPanelLayout.Overall] += delta.width;
        });
      }}
    >
      <div className={s['side-debug-panel']}>
        <PanelHeader onClose={onClose} />
        {loading ? (
          <div className={s['side-debug-panel-no-data']}>
            <Spin />
          </div>
        ) : (
          <>
            <div className={s['side-debug-panel-container']}>
              <div className={s['side-debug-panel-container-sheet']}>
                <QueryFilter
                  targetDateId={targetDateId}
                  targetExecuteStatusId={targetExecuteStatusId}
                  targetOverallSpanInfo={targetOverallSpanInfo}
                  enhancedOverallSpans={enhancedOverallSpans}
                  showLoadMore={showLoadMore}
                  onSelectDate={onSelectDate}
                  onSelectExecuteStatus={onSelectExecuteStatus}
                  onSelectQuery={setTargetOverallSpanInfo}
                  onFetchQuery={handleFetchQuery}
                />
              </div>
              {!targetOverallSpanInfo ? (
                <div className={s['side-debug-panel-no-data']}>
                  <Empty
                    image={<IllustrationNoResult />}
                    description={I18n.t('query_data_empty')}
                  />
                </div>
              ) : (
                <div className={s['side-debug-panel-container-scroll-box']}>
                  <Resizable
                    minHeight={
                      DEBUG_PANEL_LAYOUT_DEFAULT_TEMPLATE_INFO.side[
                        DebugPanelLayout.Summary
                      ].height.min
                    }
                    maxHeight={
                      DEBUG_PANEL_LAYOUT_DEFAULT_TEMPLATE_INFO.side[
                        DebugPanelLayout.Summary
                      ].height.max
                    }
                    minWidth="100%"
                    enable={{
                      bottom: true,
                    }}
                    defaultSize={{
                      height: layoutConfig.side[DebugPanelLayout.Summary],
                      width: '100%',
                    }}
                    onResizeStop={(e, d, el, delta) => {
                      setLayoutConfig(config => {
                        config.side[DebugPanelLayout.Summary] += delta.height;
                      });
                    }}
                  >
                    <div
                      className={
                        s['side-debug-panel-container-scroll-box-summary']
                      }
                    >
                      {targetOverallSpanInfo ? (
                        <PanelSummary
                          targetOverallSpanInfo={targetOverallSpanInfo}
                        />
                      ) : null}
                    </div>
                  </Resizable>
                  <Divider className={s['side-debug-panel-divider']} />
                  {subAreaLoading ? (
                    <div
                      className={
                        s['side-debug-panel-container-scroll-box-sub-loading']
                      }
                    >
                      <Spin />
                    </div>
                  ) : (
                    <SpanInfoArea
                      botId={botId}
                      spaceId={spaceID}
                      targetDetailSpan={targetDetailSpan}
                      orgDetailSpans={orgDetailSpans}
                      spanCategory={spanCategory}
                      targetOverallSpanInfo={targetOverallSpanInfo}
                      curBatchPage={curBatchPage}
                      setTargetDetailSpan={setTargetDetailSpan}
                      setCurBatchPage={setCurBatchPage}
                    />
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </Resizable>
  );
};
