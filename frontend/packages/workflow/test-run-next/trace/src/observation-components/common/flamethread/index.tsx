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

/* eslint-disable max-lines */
/* eslint-disable max-lines-per-function */

import {
  useRef,
  useEffect,
  type FC,
  useMemo,
  useCallback,
  useLayoutEffect,
  useState,
} from 'react';

import { pick, uniqWith } from 'lodash-es';
import {
  View,
  type ViewSpec,
  ComponentEnum,
  GrammarMarkType,
  type GrammarScaleType,
  type MarkSpec,
  type IView,
} from '@visactor/vgrammar';

import type {
  FlamethreadProps,
  RectNode,
  RectStyle,
  LabelStyle,
  LabelText,
  Tooltip,
  IElement,
  GlobalStyle,
  InteractionEventHandler,
} from './typing';
import {
  datazoomDecimals,
  datazoomHeight,
  datazoomPaddingBottom,
  defaultGlobalStyle,
  defaultLabelStyle,
  defaultLabelText,
  defaultRectStyle,
  defaultRowHeight,
  defaultVisibleColumnCount,
  scrollbarMargin,
} from './config';

import styles from './index.module.less';
export type {
  FlamethreadProps,
  RectNode,
  RectStyle,
  LabelStyle,
  LabelText,
  Tooltip,
  IElement,
  GlobalStyle,
  InteractionEventHandler,
};

export const Flamethread: FC<FlamethreadProps> = props => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const viewRef = useRef<IView | null>(null);
  const [viewSize, setViewSize] = useState({ width: 0, height: 0 });
  const {
    flamethreadData,
    rowHeight = defaultRowHeight,
    visibleColumnCount = defaultVisibleColumnCount,
    tooltip,
    rectStyle: globalRectStyle,
    labelStyle: _globalLabelStyle,
    globalStyle: _globalStyle,
    axisLabelSuffix,
    labelText,
    selectedKey,
    disableViewScroll = false,
    enableAutoFit = false,
    onClick,
  } = props;

  const genRectStyle = useCallback(
    (rectStyle?: RectStyle): RectStyle => ({
      normal: Object.assign(
        {},
        defaultRectStyle.normal,
        globalRectStyle?.normal,
        rectStyle?.normal,
      ),
      hover: Object.assign(
        {},
        defaultRectStyle.hover,
        globalRectStyle?.hover,
        rectStyle?.hover,
      ),
      select: Object.assign(
        {},
        defaultRectStyle.select,
        globalRectStyle?.select,
        rectStyle?.select,
      ),
    }),
    [globalRectStyle],
  );

  const genLabelStyle = useCallback(
    (labelStyle?: LabelStyle): LabelStyle =>
      Object.assign({}, defaultLabelStyle, _globalLabelStyle, labelStyle),
    [_globalLabelStyle],
  );

  const globalLabelStyle = useMemo(
    () => Object.assign({}, defaultLabelStyle, _globalLabelStyle),
    [_globalLabelStyle],
  );

  // eslint-disable-next-line @typescript-eslint/no-magic-numbers -- calculation required
  const topOffset = datazoomHeight + datazoomPaddingBottom + 8;

  const globalStyle: GlobalStyle = useMemo(
    () => Object.assign({}, defaultGlobalStyle, _globalStyle),
    [_globalStyle],
  );

  const totalRowHeight = useMemo(() => {
    const rowCount = uniqWith(
      flamethreadData,
      (node0: RectNode, node1: RectNode) => node0.rowNo === node1.rowNo,
    ).length;
    return rowCount * rowHeight;
  }, [flamethreadData]);

  // Meaning of this parameter: Visual Window Height/Flame Map Height
  const yScaleRangeFactor = useMemo(() => {
    const rowCount = uniqWith(
      flamethreadData,
      (node0: RectNode, node1: RectNode) => node0.rowNo === node1.rowNo,
    ).length;

    return rowCount !== 0
      ? ((viewRef.current?.getViewBox().height() || 300) - topOffset) /
          (rowCount * rowHeight)
      : 1;
  }, [flamethreadData, viewSize.height]);

  const spec = useMemo(() => {
    const orgData = flamethreadData.map(node => {
      const rectStyle = genRectStyle(node.rectStyle);
      const labelStyle = genLabelStyle(node.labelStyle);
      return {
        ...node,
        rectStyle,
        labelStyle,
      };
    });

    const marks = [
      {
        type: GrammarMarkType.component,
        componentType: ComponentEnum.axis,
        id: 'xAxis',
        scale: 'xScale',
        axisType: 'line',
        tickCount: visibleColumnCount,
        dependency: ['viewBox'],
        encode: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          update: (_scale: any, _element: any, params: any) => {
            const scale = params.xScale;
            const range = scale.range() as number[];
            const tickData = scale.tickData(visibleColumnCount);
            const dx =
              tickData.length > 1
                ? // eslint-disable-next-line @typescript-eslint/no-magic-numbers -- calculation required
                  (range[1] - range[0]) / (tickData.length - 1) / 2
                : 0;

            return {
              verticalFactor: -1,
              x: params.viewBox.x1,
              y: params.viewBox.y1 + topOffset,
              start: { x: 0, y: 0 },
              end: { x: params.viewBox.width(), y: 0 },
              tick: { visible: false },
              label: {
                style: { dx: -dx },
                formatMethod: (_value: string) => {
                  const value = Number(_value);
                  // Specialized logic: hide 0 ticks
                  if (dx > 0 && value === 0) {
                    return '';
                  }
                  return value !== 0 && axisLabelSuffix !== undefined
                    ? `${value}${axisLabelSuffix}`
                    : value;
                },
              },
            };
          },
        },
      },
      {
        type: GrammarMarkType.component,
        componentType: ComponentEnum.grid,
        tickCount: visibleColumnCount, // The types of the vgrammer library are not strictly written, but are actually usable
        scale: 'xScale',
        gridType: 'line',
        gridShape: 'line',
        dependency: ['viewBox'],
        // dependency: ["viewBox"],
        encode: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          update: (_scale: any, _element: any, params: any) => ({
            verticalFactor: -1,
            length: params.viewBox.height() - topOffset,
            x: params.viewBox.x1,
            x1: params.viewBox.x2,
            y: params.viewBox.y1 + topOffset,
            start: { x: 0, y: 0 },
            end: { x: params.viewBox.width(), y: 0 },
            style: { stroke: '#ccc', lineWidth: 1, lineDash: [] },
          }),
        },
      },
      {
        type: GrammarMarkType.group,
        dependency: ['viewBox'],
        encode: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          update: (_scale: any, _element: IElement, params: any) => ({
            x: params.viewBox.x1,
            y: params.viewBox.y1 + topOffset,
            width: params.viewBox.width(),
            height: params.viewBox.height() - topOffset,
            clip: true,
          }),
        },

        marks: [
          {
            type: GrammarMarkType.rect,
            id: 'rect',
            from: { data: 'orgData' },
            groupBy: 'start',
            key: 'rowNo',
            encode: {
              update: {
                x: { scale: 'xScale', field: 'start' },
                x1: { scale: 'xScale', field: 'end' },
                y: { scale: 'yScale', field: 'rowNo', band: 0.07 },
                // height: { scale: 'yScale', band: 0.86 },
                height: rowHeight - 4,
                // height: { scale: "yScale", band: 0.7, offset: 0.15 },
                fill: (datum, _element, _params) =>
                  datum?.rectStyle?.normal?.fill,
                innerBorder: (datum, _element, _params) => {
                  const { stroke, lineWidth, lineDash } =
                    datum.rectStyle.normal;
                  return {
                    stroke: lineWidth !== 0 ? stroke : null,
                    lineWidth,
                    lineDash,
                    visible: true,
                    // eslint-disable-next-line @typescript-eslint/no-magic-numbers -- size calculation, no processing required
                    distance: lineWidth / 2,
                  };
                },
              },
              hover2: {
                fill: (datum, _element, _params) =>
                  datum?.rectStyle?.hover?.fill ??
                  datum?.rectStyle?.normal?.fill,
                innerBorder: (datum, _element, _params) => {
                  const { stroke, lineWidth, lineDash } = Object.assign(
                    {},
                    datum?.rectStyle?.normal,
                    datum?.rectStyle?.hover,
                  );
                  return {
                    stroke: lineWidth !== 0 ? stroke : null,
                    lineWidth,
                    lineDash,
                    visible: true,
                    // eslint-disable-next-line @typescript-eslint/no-magic-numbers -- size calculation, no need to define constants
                    distance: lineWidth / 2,
                  };
                },
                zIndex: 2,
              },
              select2: {
                fill: (datum, _element, _params) =>
                  datum?.rectStyle?.select?.fill ??
                  datum?.rectStyle?.normal?.fill,
                innerBorder: (datum, _element, _params) => {
                  const { stroke, lineWidth, lineDash } = Object.assign(
                    {},
                    datum?.rectStyle?.normal,
                    datum?.rectStyle?.select,
                  );
                  return {
                    stroke: lineWidth !== 0 ? stroke : null,
                    lineWidth,
                    lineDash,
                    visible: true,
                    // eslint-disable-next-line @typescript-eslint/no-magic-numbers -- size calculation, no need to define constants
                    distance: lineWidth / 2,
                  };
                },
                zIndex: 1,
              },
            },
          },
          {
            type: GrammarMarkType.component,
            componentType: ComponentEnum.label,
            target: 'rect',
            labelStyle: {
              position: globalLabelStyle.position,
              textStyle: {
                fontSize: globalLabelStyle.fontSize,
              },
              animation: false,
              overlap: {
                hideOnHit: false,
                clampForce: false,
                strategy: [{ type: 'position', position: ['top-left'] }],
              },
            },
            encode: {
              update: {
                pickable: false, // The types of the vgrammer library are not strictly written, but are actually usable
                text: labelText ?? defaultLabelText,
                fill: (datum, _element, _params) => datum?.labelStyle.fill,
              },
            },
          },
        ],
      },

      {
        type: GrammarMarkType.component,
        componentType: ComponentEnum.datazoom,
        id: 'dataZoom',
        dependency: ['viewBox'],
        preview: {
          data: 'table',
          x: { scale: 'dataZoomXScale', field: ['start', 'end'] },
          y: { scale: 'dataZoomYScale', field: 'rowNo' },
        },
        encode: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          update: (_scale: any, _element: any, params: any) => ({
            showDetail: false,
            x: params.viewBox.x1,
            y: params.viewBox.y1,
            size: { width: params.viewBox.width(), height: datazoomHeight },
            // start: 0,
            // end: 1,
            // fill: '#ff0000',
            minSpan: 0.01,
            selectedBackgroundStyle: {
              fill: '#B4BAF6',
            },
            brushSelect: false,
            startHandlerStyle: {
              symbolType:
                'M-0.5-2.4h0.9c0.4,0,0.7,0.3,0.7,0.7v3.3c0,0.4-0.3,0.7-0.7,0.7h-0.9c-0.4,0-0.7-0.3-0.7-0.7v-3.3\nC-1.2-2-0.9-2.4-0.5-2.4z M-0.4-1.4L-0.4-1.4c0,0,0,0.1,0,0.1v2.6c0,0.1,0,0.1,0,0.1l0,0c0,0,0-0.1,0-0.1v-2.6\nC-0.4-1.4-0.4-1.4-0.4-1.4z M0.3-1.4L0.3-1.4c0,0,0,0.1,0,0.1v2.6c0,0.1,0,0.1,0,0.1l0,0c0,0,0-0.1,0-0.1v-2.6\nC0.3-1.4,0.3-1.4,0.3-1.4z;',
              fill: '#ffffff',
              scaleX: 1.2,
              scaleY: 1.2,
              stroke: '#aeb5be',
              lineWidth: 1,
              size: 20,
            },
            middleHandlerStyle: {
              visible: false,
            },
            endHandlerStyle: {
              symbolType:
                'M-0.5-2.4h0.9c0.4,0,0.7,0.3,0.7,0.7v3.3c0,0.4-0.3,0.7-0.7,0.7h-0.9c-0.4,0-0.7-0.3-0.7-0.7v-3.3\nC-1.2-2-0.9-2.4-0.5-2.4z M-0.4-1.4L-0.4-1.4c0,0,0,0.1,0,0.1v2.6c0,0.1,0,0.1,0,0.1l0,0c0,0,0-0.1,0-0.1v-2.6\nC-0.4-1.4-0.4-1.4-0.4-1.4z M0.3-1.4L0.3-1.4c0,0,0,0.1,0,0.1v2.6c0,0.1,0,0.1,0,0.1l0,0c0,0,0-0.1,0-0.1v-2.6\nC0.3-1.4,0.3-1.4,0.3-1.4z;',
              fill: '#ffffff',
              scaleX: 1.2,
              scaleY: 1.2,
              stroke: '#aeb5be',
              lineWidth: 1,
              size: 20,
            },
            startTextStyle: {
              padding: 8,
              textStyle: {
                fontSize: 12,
                lineHeight: '130%',
                fill: '#606773',
                // fill: '#ff0000',
              },
              formatMethod: (value: number) => value.toFixed(datazoomDecimals),
            },
            endTextStyle: {
              padding: 8,
              textStyle: {
                fontSize: 12,
                lineHeight: '130%',
                fill: '#606773',
              },
              formatMethod: (value: number) => value.toFixed(datazoomDecimals),
            },
          }),
        },
      },
    ] as MarkSpec[];

    const padding = {
      top: 3,
      right: 0,
      bottom: 0,
      left: 0,
    };

    if (yScaleRangeFactor < 1) {
      marks.unshift({
        type: GrammarMarkType.component,
        componentType: ComponentEnum.scrollbar,
        direction: 'vertical',
        id: 'verticalScrollbar',
        dependency: ['viewBox', 'yScale'],
        encode: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          update: (_scale: any, _element: any, params: any) => {
            const { yScale } = params;
            const curRangeFactor = yScale?.rangeFactor?.() ?? [
              0,
              yScaleRangeFactor,
            ];

            return {
              x: params.viewBox.x2 + scrollbarMargin,
              y: params.viewBox.y1 + topOffset,
              height: params.viewBox.height() - topOffset,
              range: [curRangeFactor[1], curRangeFactor[0]],
            };
          },
        },
      });
      padding.right = 22;
    }

    const spec0: ViewSpec = {
      padding,
      background: globalStyle.background,

      data: [
        {
          id: 'orgData',
          values: orgData,
        },
        {
          id: 'markData',
          source: 'orgData',
        },
      ],

      scales: [
        {
          id: 'xScale',
          type: 'linear' as GrammarScaleType,
          domain: { data: 'markData', field: ['start', 'end'] },
          dependency: ['viewBox'],
          range: (_scale, params) => [0, params.viewBox.width()],
          nice: true,
        },
        {
          id: 'yScale',
          type: 'band',
          domain: { data: 'markData', field: 'rowNo' },
          dependency: ['viewBox'],
          range: (_scale, params) => {
            const vHeight = params.viewBox.height() - topOffset;
            const height = yScaleRangeFactor <= 1 ? vHeight : totalRowHeight;

            return [0, height];
          },
          padding: 0,
          round: false,
        },
        {
          id: 'dataZoomXScale',
          type: 'linear',
          domain: { data: 'orgData', field: ['start', 'end'] },
          dependency: ['viewBox'],
          range: (_scale, params) => [0, params.viewBox.width()],
        },
        {
          id: 'dataZoomYScale',
          type: 'band',
          domain: { data: 'orgData', field: 'rowNo' },
          dependency: ['viewBox'],
          range: (_scale, params) => [params.viewBox.height(), 0],
          padding: 0.05,
          round: true,
        },
      ],

      marks,
    };
    return spec0;
  }, [
    flamethreadData,
    visibleColumnCount,
    globalLabelStyle.position,
    globalLabelStyle.fontSize,
    labelText,
    yScaleRangeFactor,
    totalRowHeight,
    globalStyle.padding,
    globalStyle.background,
    genRectStyle,
    genLabelStyle,
    axisLabelSuffix,
  ]);

  const updateSelectedKey = useCallback(
    (view: IView) => {
      const rectElm = view?.getMarkById('rect');
      const elements = rectElm?.elements;
      elements?.forEach(element => {
        element?.removeState('select2');
      });
      elements
        ?.filter(element => {
          const datum = element.getDatum();
          return datum.key === selectedKey;
        })[0]
        ?.addState('select2');
    },
    [selectedKey],
  );

  // Create/update view
  useLayoutEffect(() => {
    const initializeYScale = (view: IView) => {
      const yScale = view?.getScaleById('yScale');
      yScale?.setRangeFactor([0, yScaleRangeFactor]);
      yScale?.commit();
    };

    const initializeScale = (view: IView) => {
      initializeYScale(view);
    };

    const registerEvent = (view: IView) => {
      const rectElm = view?.getMarkById('rect');
      // Rect click event
      rectElm?.addEventListener('click', ((event, element) => {
        onClick?.(event, element);
      }) as InteractionEventHandler);

      rectElm?.addEventListener('touchstart', ((event, element) => {
        onClick?.(event, element);
      }) as InteractionEventHandler);

      // Rect hover highlight
      view?.interaction('element-highlight', {
        selector: 'rect',
        highlightState: 'hover2',
      });

      view?.interaction('element-highlight', {
        trigger: 'click',
        // triggerOff: "view:click",
        triggerOff: 'swipe',
        selector: 'rect',
        highlightState: 'select2',
      });

      if (!disableViewScroll) {
        view.interaction('view-scroll', {
          scaleY: 'yScale',
        });
      }

      // Rect hover tooltip
      if (tooltip) {
        view?.interaction('tooltip', {
          selector: 'rect',
          ...tooltip,
        });
      }
    };

    if (containerRef.current && !viewRef.current) {
      const view = new View({
        autoFit: enableAutoFit,
        container: containerRef.current,
      });

      view?.on('change', (...args) => {
        const event = args[0];
        const { start, end } = event.detail;
        const xScale = view.getScaleById('xScale');
        xScale?.setRangeFactor([start, end]);
        xScale?.commit();
        view?.run();
      });

      view?.on('scrollDrag', e => {
        const direction = e?.target?.attribute?.direction;
        if (direction === 'vertical') {
          const range = e.detail.value;
          const yScale = view.getScaleById('yScale');
          yScale?.setRangeFactor(range);
          yScale?.commit();
          view.run();
        }
      });

      view.parseSpec(spec);
      initializeScale(view);
      registerEvent(view);
      view.run();
      updateSelectedKey(view);

      view.run();

      viewRef.current = view;
    } else if (viewRef.current) {
      const view = viewRef.current;

      view.updateSpec(spec);
      initializeScale(view);
      registerEvent(view);
      view.run({ reuse: false });
      updateSelectedKey(view);

      view.run();
    }
  }, [
    spec,
    tooltip,
    yScaleRangeFactor,
    // onClick,
    visibleColumnCount,
    flamethreadData,
  ]);

  useEffect(() => {
    if (viewRef.current) {
      updateSelectedKey(viewRef.current);
    }
  }, [selectedKey]);

  useEffect(
    () => () => {
      if (viewRef.current) {
        viewRef.current.release();
      }
      viewRef.current = null;
    },
    [],
  );

  useEffect(() => {
    const resizeObserver = new ResizeObserver(params => {
      const width = params[0].target.clientWidth;
      const height = params[0].target.clientHeight;
      if (width !== undefined && height !== undefined && viewRef.current) {
        viewRef.current.resize(width, height);
        setViewSize({
          width,
          height,
        });
      }
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }
  }, []);

  return (
    <div
      className={styles['flame-thread-canvas-wrapper']}
      style={{
        ...pick(globalStyle, ['width', 'height']),
        overflow: 'hidden',
      }}
      ref={containerRef}
    />
  );
};
