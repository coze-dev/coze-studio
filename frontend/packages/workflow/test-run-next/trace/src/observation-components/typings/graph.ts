import { type ReactNode } from 'react';

import { type TooltipProps } from '@coze/coze-design';

import { type TraceFrontendSpan } from '../typings/idl';
import { type TreeProps } from '../common/tree';
import {
  type RectStyle,
  type FlamethreadProps,
  type LabelStyle,
} from '../common/flamethread';

export type TraceTreeProps = {
  spans: SpanNode[];
  selectedSpanId?: string;
  renderGraphNodeConfig?: RenderGraphNodeConfig;
  onCollapseChange?: (id: string) => void;
  defaultDisplayMode?: DisplayMode;
  /**
   * 隐藏模式选择器
   */
  hideModeSelect?: boolean;
  /** 宿主用户信息 */
  hostUser?: {
    /** 用户邮箱 */
    email?: string;
    /** user id */
    id?: string;
  };
} & Pick<
  TreeProps,
  | 'indentDisabled'
  | 'lineStyle'
  | 'globalStyle'
  | 'onSelect'
  | 'onClick'
  | 'onMouseMove'
  | 'onMouseEnter'
  | 'onMouseLeave'
  | 'className'
>;

export type TraceFlamethreadProps = {
  spans: SpanNode[];
  selectedSpanId?: string;
  renderGraphNodeConfig?: RenderGraphNodeConfig;
} & Pick<
  FlamethreadProps,
  | 'rectStyle'
  | 'labelStyle'
  | 'globalStyle'
  | 'rowHeight'
  | 'visibleColumnCount'
  | 'datazoomDecimals'
  | 'axisLabelSuffix'
  | 'disableViewScroll'
  | 'enableAutoFit'
  | 'onClick'
>;

export type SpanNode = TraceFrontendSpan & {
  children?: SpanNode[];
  isBroken?: boolean;
};

export type TraceTreeStyleDefaultProps = Pick<
  TraceTreeProps,
  'lineStyle' | 'globalStyle'
>;

export interface FlamethreadStyleConfig {
  rectStyle?: RectStyle;
  labelStyle?: LabelStyle;
}

export interface NodePresetConfig {
  icon?: ReactNode;
  flamethread?: FlamethreadStyleConfig;
}

export interface NodeConfig extends NodePresetConfig {
  character?: string;
  color?: string;
}

export interface TraceTreeCustomRenderer {
  renderTooltip?: (spanNode: SpanNode) => TooltipProps;
  renderExtra?: (spanNode: SpanNode) => ReactNode;
}

export interface TraceFlamethreadCustomRenderer {
  renderTooltip?: (spanNode: SpanNode) => FlamethreadTooltipConfig[];
}

export interface RenderGraphNodeConfig {
  customTypeConfigMap?: Record<string | number, NodePresetConfig | undefined>;
  traceTreeCustomRenderer?: TraceTreeCustomRenderer;
  traceFlamethreadCustomRenderer?: TraceFlamethreadCustomRenderer;
}

export interface FlamethreadTooltipConfig {
  key: string;
  value?: string;
  fill?: string;
}

export interface SpanNodeRenderOptions {
  renderGraphNodeConfig?: RenderGraphNodeConfig;
  showKeyNodeOnly?: boolean;
}

export type DisplayMode = 'default' | 'simplification';
