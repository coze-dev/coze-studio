import { type CSSProperties } from 'react';

import {
  type InteractionEventHandler,
  type TooltipSpec,
  type ViewSpec,
  type IElement,
} from '@visactor/vgrammar';

export type { IElement, InteractionEventHandler, TooltipSpec };

export interface RectStyleAttrs {
  fill?: string;
  stroke?: string;
  lineWidth?: number;
  lineDash?: number[];
}

export interface RectStyle {
  normal?: RectStyleAttrs;
  hover?: RectStyleAttrs;
  select?: RectStyleAttrs;
}

export interface LabelStyle {
  position?: string;
  fontSize?: number;
  fill?: string;
}

export interface RectNode {
  key: string;
  rowNo: number;
  start: number;
  end: number;
  rectStyle?: RectStyle;
  labelStyle?: Pick<LabelStyle, 'fill'>;
  // 其他字段，会透传
  extra?: unknown;
}

export type Tooltip = Pick<TooltipSpec, 'title' | 'content'>;

export type GlobalStyle = Pick<CSSProperties, 'width' | 'height'> &
  Pick<ViewSpec, 'padding' | 'background'>;

export type LabelText = (
  datum: RectNode,
  element: IElement,
  params: unknown,
) => string;

export interface FlamethreadProps {
  flamethreadData: RectNode[];
  rectStyle?: RectStyle;
  labelStyle?: LabelStyle;
  labelText?: LabelText;
  // 结构太复杂，直接暴漏即可
  tooltip?: Tooltip;
  globalStyle?: GlobalStyle;
  rowHeight?: number;
  visibleColumnCount?: number;
  // valuePerColumn?: number;
  datazoomDecimals?: number;
  axisLabelSuffix?: string;
  selectedKey?: string;
  disableViewScroll?: boolean;
  enableAutoFit?: boolean;
  onClick?: InteractionEventHandler;
}
