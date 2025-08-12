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

import { type WorkflowLinkLogData } from '@/types';

import { type LogType } from './constants';

/** Possible values in the log */
export type LogValueType =
  | string
  | null
  | number
  | object
  | boolean
  | undefined;

/** Normal log structure */
export interface BaseLog {
  label: string;
  data: LogValueType;
  copyTooltip?: string;
  type: LogType;
  emptyPlaceholder?: string;
}

/**
 * Value of condition
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

/** Log structure for conditions */
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
 * Output log structure
 */
export interface OutputLog {
  label: string;
  data: LogValueType;
  copyTooltip?: string;
  type: LogType.Output;
  /** Node type */
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
