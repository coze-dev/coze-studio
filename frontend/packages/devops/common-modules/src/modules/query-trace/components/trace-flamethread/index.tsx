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

import { useEffect, type FC, useMemo, useState, useCallback } from 'react';

import { type IElement } from '@visactor/vgrammar';
import { I18n } from '@coze-arch/i18n';

import Flamethread, {
  type LabelText,
  type RectNode,
  type RectStyle,
  type Tooltip,
} from '../flamethread';
import {
  getSpanDataByTraceId,
  getSpanTitle,
  getStatusLabel,
} from '../../utils/cspan-graph';
import { getTokens } from '../../utils/cspan';
import { DataSourceTypeEnum } from '../../typings/graph';
import { type CSpan } from '../../typings/cspan';
import { spanData2flamethreadData } from './util';
import { type TraceFlamethreadProps } from './typing';
import { defaultProps, spanStatusConfig, tooltipStyle } from './config';

const TraceFlamethread: FC<TraceFlamethreadProps> = props => {
  const [flamethreadData, setFlamethreadData] = useState<RectNode[]>([]);

  const {
    dataSource: { type: dataType, spanData, traceId },
    rectStyle: _rectStyle,
    labelStyle: _labelStyle,
    globalStyle: _globalStyle,
    visibleColumnCount,
    datazoomDecimals = defaultProps.datazoomDecimals,
    axisLabelSuffix,
    selectedSpanId,
    spanTypeConfigMap,
    spanStatusConfigMap,
    disableViewScroll,
    enableAutoFit,
    onClick,
  } = props;

  // Initialize flamethreadData
  useEffect(() => {
    if (dataType === DataSourceTypeEnum.SpanData && spanData) {
      if (spanData?.length === 0 && flamethreadData.length === 0) {
        return;
      }

      const rectNodes = spanData2flamethreadData(spanData);
      setFlamethreadData(rectNodes);
    } else if (dataType === DataSourceTypeEnum.TraceId && traceId) {
      const spans = getSpanDataByTraceId(traceId);
      const rectNodes = spanData2flamethreadData(spans);
      setFlamethreadData(rectNodes);
    }
  }, [dataType, spanData, traceId]);

  const rectStyle = useMemo((): RectStyle => {
    const defaultRectStyle = defaultProps.rectStyle;
    return {
      normal: Object.assign({}, defaultRectStyle?.normal, _rectStyle?.normal),
      hover: Object.assign({}, defaultRectStyle?.hover, _rectStyle?.hover),
      select: Object.assign({}, defaultRectStyle?.select, _rectStyle?.select),
    };
  }, [_rectStyle]);

  const labelStyle = useMemo(
    () => Object.assign({}, _labelStyle, defaultProps.labelStyle),
    [_labelStyle],
  );

  const globalStyle = useMemo(
    () => Object.assign({}, _globalStyle, defaultProps.globalStyle),
    [_globalStyle],
  );

  const tooltip: Tooltip = useMemo(
    () => ({
      title: {
        value: (datum: RectNode, element: IElement, params) => ({}),
      },
      content: (datum: RectNode, element: IElement, params) => {
        const { span } = (datum.extra ?? {}) as { span: CSpan };
        if (!span) {
          return [];
        }

        const { status, latency } = span;
        const statusConfig = spanStatusConfig[status];

        const tips = [
          {
            key: I18n.t('analytic_query_status'),
            value: getStatusLabel(span, spanStatusConfigMap),
          },
          {
            key: I18n.t('analytic_query_latency'),
            value: latency ? `${latency}ms` : '-',
          },
        ];
        const { input_tokens: inputTokens, output_tokens: outputTokens } =
          getTokens(span);
        if (inputTokens !== undefined && outputTokens !== undefined) {
          tips.push({
            key: I18n.t('analytic_query_tokens'),
            value: `${inputTokens + outputTokens}`,
          });
        }

        return tips.map(({ key, value }) => ({
          key: {
            text: key,
            fill: tooltipStyle.fill,
          },
          value: {
            text: value ?? '',
            fill:
              key === I18n.t('analytic_query_status')
                ? statusConfig?.tooltip?.fill
                : tooltipStyle.fill,
          },
          shape: tooltipStyle.shape,
        }));
      },
    }),
    [spanStatusConfigMap],
  );

  const labelText: LabelText = useCallback(
    (datum: RectNode, element: IElement, params) => {
      const { span } = (datum.extra ?? {}) as { span: CSpan };
      return getSpanTitle(span, spanTypeConfigMap);
    },
    [spanTypeConfigMap],
  );

  return flamethreadData ? (
    <Flamethread
      flamethreadData={flamethreadData}
      tooltip={tooltip}
      rectStyle={rectStyle}
      labelStyle={labelStyle}
      globalStyle={globalStyle}
      labelText={labelText}
      datazoomDecimals={datazoomDecimals}
      visibleColumnCount={visibleColumnCount}
      axisLabelSuffix={axisLabelSuffix}
      selectedKey={selectedSpanId}
      disableViewScroll={disableViewScroll}
      enableAutoFit={enableAutoFit}
      onClick={onClick}
    />
  ) : null;
};

export default TraceFlamethread;
