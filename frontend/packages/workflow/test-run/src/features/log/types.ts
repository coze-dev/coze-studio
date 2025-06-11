import { type WorkflowLinkLogData } from '@/types';

import { type LogType } from './constants';

/** log 中的 value 可能值 */
export type LogValueType =
  | string
  | null
  | number
  | object
  | boolean
  | undefined;

/** 通常的日志结构 */
export interface BaseLog {
  label: string;
  data: LogValueType;
  copyTooltip?: string;
  type: LogType;
  emptyPlaceholder?: string;
}

/**
 * condition 的值
 */
export interface ConditionData {
  leftData: LogValueType;
  rightData: LogValueType;
  operatorData: string;
}
export interface ConditionGroup {
  conditions: ConditionData[];
  name: string;
  logic: number;
  logicData: string;
}

/** condition 的日志结构 */
export interface ConditionLog {
  conditions: ConditionGroup[];
  type: LogType.Condition;
}

export interface FunctionCallLogItem {
  name: string;
  inputs?: Record<string, unknown>;
  outputs: string | Record<string, unknown>;
  icon: string;
}

export interface FunctionCallLog {
  type: LogType.FunctionCall;
  items: FunctionCallLogItem[];
  copyTooltip?: string;
  data: LogValueType;
}

/**
 * 输出的日志结构
 */
export interface OutputLog {
  label: string;
  data: LogValueType;
  copyTooltip?: string;
  type: LogType.Output;
  /** 节点类型 */
  nodeType: string;
  mockInfo?: {
    isHit: boolean;
    mockSetName?: string;
  };
  rawOutput?: {
    data: LogValueType;
  };
}

export interface WorkflowLinkLog {
  type: LogType.WorkflowLink;
  label: string;
  data: WorkflowLinkLogData;
}

export type Log =
  | BaseLog
  | ConditionLog
  | OutputLog
  | FunctionCallLog
  | WorkflowLinkLog;
