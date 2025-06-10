import {
  type FieldItem,
  type CSpan,
} from '@coze-devops/common-modules/query-trace';
import {
  type SpanType,
  type ListDebugQueriesRequest,
} from '@coze-arch/bot-api/ob_query_api';
import { type SpanStatus } from '@coze-arch/bot-api/debugger_api';

import { type FieldType } from '../utils/field-item';

export type QueryFilterItemId = SpanStatus | string;

export type Placement = 'left' | 'bottom';

export interface QueryFilterItem {
  id: QueryFilterItemId;
  name: string;
}

export type DailyTime = Pick<ListDebugQueriesRequest, 'startAtMS' | 'endAtMS'>;

export interface BasicInfo {
  botId?: string;
  spaceID?: string;
  userID?: string;
  placement: Placement;
}

export interface UTCTimeInfo {
  timeOffsetString: string;
  dateString: string;
}

export interface TargetOverallSpanInfo {
  value: string;
  input: string;
  output: string;
  span: CSpan;
}

export interface SpanInfoConfig {
  label?: string;
}

export interface SpanStatusConfig extends SpanInfoConfig {
  icon: React.ReactNode;
  className: string;
}

export interface FieldConfigOptions {
  copyable?: boolean;
  fullLine?: boolean;
}
export interface FieldConfig {
  name: FieldType;
  options?: FieldConfigOptions;
}

export interface FieldColConfig {
  fields: FieldConfig[];
}

export type FieldColItem = FieldItem & {
  options?: FieldConfigOptions;
};

export interface FieldCol {
  fields: FieldColItem[];
}

export type BatchSpanType =
  | SpanType.LLMBatchCall
  | SpanType.WorkflowLLMBatchCall
  | SpanType.PluginToolBatch
  | SpanType.WorkflowPluginToolBatch
  | SpanType.CodeBatch
  | SpanType.WorkflowCodeBatch;

export enum DebugPanelLayout {
  Overall = 'Overall',
  Summary = 'Summary',
  Chat = 'Chat',
}

export interface LayoutData {
  min?: number | string;
  max?: number | string;
}

export interface LayoutConfig {
  width: LayoutData;
  height: LayoutData;
}

export interface DebugPanelLayoutTemplateConfig {
  side: Record<DebugPanelLayout, LayoutConfig>;
  bottom: Record<DebugPanelLayout, LayoutConfig>;
}

export interface DebugPanelLayoutConfig {
  side: Record<DebugPanelLayout, number>;
  bottom: Record<DebugPanelLayout, number>;
}
