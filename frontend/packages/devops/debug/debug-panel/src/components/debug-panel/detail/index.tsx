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

/* eslint-disable @coze-arch/max-line-per-function */
import ReactJson from 'react-json-view';
import { useMemo } from 'react';

import classNames from 'classnames';
import { JsonLinkPreview } from '@coze-devops/json-link-preview';
import {
  type CSpanSingle,
  type CSPanBatch,
  type CSpan,
  TopologyFlow,
  DataSourceTypeEnum,
  isBatchSpanType,
} from '@coze-devops/common-modules/query-trace';
import { I18n } from '@coze-arch/i18n';
import { Divider, Pagination, Tag } from '@coze-arch/bot-semi';
import { SpanStatus } from '@coze-arch/bot-api/ob_query_api';

import { NodeDescription, NodeDetailTitle } from '../common';
import { jsonParse, textWithFallback } from '../../../utils';
import { useSpanCols } from '../../../hooks/use-span-cols';
import { useBatchSpanCols } from '../../../hooks/use-batch-span-cols';
import {
  REACT_JSON_VIEW_CONFIG,
  topologyTypeConfig,
} from '../../../consts/static';

import s from './index.module.less';

export interface PanelDetailProps {
  botId: string;
  spaceId: string;
  spans: CSpan[];
  targetDetailSpan: CSpan;
  curBatchPage: number;
  setCurBatchPage: (curBatchPage: number) => void;
}

export const PanelDetail = (props: PanelDetailProps) => {
  const {
    botId,
    spaceId,
    spans,
    targetDetailSpan,
    curBatchPage,
    setCurBatchPage,
  } = props;

  const isBatchNode = useMemo(
    () => isBatchSpanType(targetDetailSpan.type),
    [targetDetailSpan],
  );

  const { spanCols } = useSpanCols({ span: targetDetailSpan });

  const { batchSpanCols } = useBatchSpanCols({
    span: targetDetailSpan,
    curBatchIndex: curBatchPage - 1,
  });

  const batchArea = useMemo(() => {
    if (!isBatchNode) {
      return null;
    }
    const batchSpan = targetDetailSpan as CSPanBatch;

    return (
      <>
        <NodeDetailTitle text={I18n.t('query_select_batch')} />
        <Pagination
          className={s['detail-pagination']}
          total={batchSpan.spans.length}
          pageSize={1}
          currentPage={curBatchPage}
          onPageChange={setCurBatchPage}
        />
        <NodeDescription cols={batchSpanCols} />
      </>
    );
  }, [isBatchNode, targetDetailSpan, curBatchPage, batchSpanCols]);

  const inputArea = useMemo(() => {
    const span = isBatchNode
      ? (targetDetailSpan as CSPanBatch)?.spans[curBatchPage - 1]
      : (targetDetailSpan as CSpanSingle);

    const inputValue = jsonParse(
      textWithFallback(span?.extra?.input) as string,
    );

    return (
      <>
        <NodeDetailTitle
          text={I18n.t('query_detail_title_input')}
          copyContent={
            typeof inputValue === 'string'
              ? inputValue
              : JSON.stringify(inputValue)
          }
        />
        <div className={s['detail-border-box']}>
          {typeof inputValue === 'string' ? (
            <div className={s['detail-text']}>{inputValue}</div>
          ) : (
            <div className={s['react-json-container']}>
              {Array.isArray(inputValue) ? (
                <JsonLinkPreview
                  src={inputValue}
                  bot_id={botId}
                  space_id={spaceId}
                />
              ) : (
                <ReactJson
                  src={inputValue}
                  {...REACT_JSON_VIEW_CONFIG}
                  style={{
                    fontSize: 12,
                  }}
                />
              )}
            </div>
          )}
        </div>
      </>
    );
  }, [isBatchNode, targetDetailSpan, curBatchPage]);

  const outputArea = useMemo(() => {
    const span = isBatchNode
      ? (targetDetailSpan as CSPanBatch)?.spans[curBatchPage - 1]
      : (targetDetailSpan as CSpanSingle);

    const { status } = span;
    const outputValue = jsonParse(
      textWithFallback(span?.extra?.output) as string,
    );

    const isError = status === SpanStatus.Error;

    return (
      <>
        <NodeDetailTitle
          text={I18n.t('query_detail_title_output')}
          copyContent={
            typeof outputValue === 'string'
              ? outputValue
              : JSON.stringify(outputValue)
          }
        />
        <div
          className={classNames(
            s['detail-border-box'],
            isError && s['detail-border-box_error'],
          )}
        >
          {typeof outputValue === 'string' ? (
            <div className={s['detail-text']}>{outputValue}</div>
          ) : (
            <div className={s['react-json-container']}>
              {Array.isArray(outputValue) ? (
                <JsonLinkPreview
                  src={outputValue}
                  bot_id={botId}
                  space_id={spaceId}
                />
              ) : (
                <ReactJson
                  src={outputValue}
                  {...REACT_JSON_VIEW_CONFIG}
                  style={{
                    fontSize: 12,
                  }}
                />
              )}
            </div>
          )}
        </div>
      </>
    );
  }, [isBatchNode, targetDetailSpan, curBatchPage]);

  const topologyArea = useMemo(
    () => (
      <TopologyFlow
        botId={botId}
        spaceId={spaceId}
        dataSource={{
          type: DataSourceTypeEnum.SpanData,
          spanData: spans,
        }}
        selectedSpanId={targetDetailSpan.id}
        className={s['topology-flow']}
        renderHeader={type => (
          <div className={s['topology-flow-header']}>
            <div className={s['topology-flow-header-title']}>
              {I18n.t('analytic_query_detail_topology')}
            </div>
            <Tag size="small" style={{ top: 1 }}>
              {topologyTypeConfig[type]}
            </Tag>
          </div>
        )}
      />
    ),
    [botId, spaceId, spans, targetDetailSpan.id],
  );

  return (
    <div className={s['detail-container']}>
      <div className={s['detail-title-container']}>
        {I18n.t('query_node_details')}
      </div>
      <NodeDescription cols={spanCols} />
      <Divider margin={24} />
      {batchArea}
      {inputArea}
      {outputArea}
      {topologyArea}
    </div>
  );
};
