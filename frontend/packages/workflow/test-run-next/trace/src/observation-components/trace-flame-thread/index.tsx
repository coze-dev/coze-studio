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

import { useEffect, useMemo, useState } from 'react';

import { useMemoizedFn } from 'ahooks';

import { spanData2flamethreadData } from '../utils/graph';
import { type SpanNode, type TraceFlamethreadProps } from '../typings/graph';
import {
  FLAME_THREAD_DEFAULT_CONFIG,
  FLAME_THREAD_DEFAULT_TOOLTIP_STYLE,
} from '../consts/graph';
import {
  Flamethread,
  type RectStyle,
  type RectNode,
  type Tooltip,
  type LabelText,
} from '../common/flamethread';

export const TraceFlameThread = (props: TraceFlamethreadProps) => {
  const [flamethreadData, setFlamethreadData] = useState<RectNode[]>([]);

  const {
    spans,
    selectedSpanId,
    rectStyle: _rectStyle,
    labelStyle: _labelStyle,
    globalStyle: _globalStyle,
    visibleColumnCount,
    datazoomDecimals = FLAME_THREAD_DEFAULT_CONFIG.datazoomDecimals,
    axisLabelSuffix,
    disableViewScroll,
    enableAutoFit,
    onClick,
    renderGraphNodeConfig,
  } = props;

  const { traceFlamethreadCustomRenderer, customTypeConfigMap } =
    renderGraphNodeConfig || {};

  useEffect(() => {
    const rectNodes = spanData2flamethreadData(spans, customTypeConfigMap);
    setFlamethreadData(rectNodes);
  }, [spans]);

  const rectStyle = useMemo((): RectStyle => {
    const defaultRectStyle = FLAME_THREAD_DEFAULT_CONFIG.rectStyle;
    return {
      normal: Object.assign({}, defaultRectStyle?.normal, _rectStyle?.normal),
      hover: Object.assign({}, defaultRectStyle?.hover, _rectStyle?.hover),
      select: Object.assign({}, defaultRectStyle?.select, _rectStyle?.select),
    };
  }, [_rectStyle]);

  const labelStyle = useMemo(
    () =>
      Object.assign({}, _labelStyle, FLAME_THREAD_DEFAULT_CONFIG.labelStyle),
    [_labelStyle],
  );

  const globalStyle = useMemo(
    () =>
      Object.assign({}, _globalStyle, FLAME_THREAD_DEFAULT_CONFIG.globalStyle),
    [_globalStyle],
  );

  const tooltip: Tooltip = useMemo(
    () => ({
      title: {
        value: () => ({}),
      },
      content: (datum: RectNode) => {
        const { span } = (datum.extra ?? {}) as { span: SpanNode };
        if (!span) {
          return [];
        }

        const tips =
          traceFlamethreadCustomRenderer?.renderTooltip?.(span) ?? [];

        return tips.map(({ key, value, fill }) => ({
          key: {
            text: key,
            fill: fill ?? FLAME_THREAD_DEFAULT_TOOLTIP_STYLE.fill,
          },
          value: {
            text: value ?? '',
            fill: fill ?? FLAME_THREAD_DEFAULT_TOOLTIP_STYLE.fill,
          },
          shape: FLAME_THREAD_DEFAULT_TOOLTIP_STYLE.shape,
        }));
      },
    }),
    [traceFlamethreadCustomRenderer],
  );

  const labelText: LabelText = useMemoizedFn((datum: RectNode) => {
    const { span } = (datum.extra ?? {}) as { span: SpanNode };
    return span.name ?? '';
  });

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
