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

/** Possible values in the log */
export type LogValueType =
  | string
  | null
  | number
  | object
  | boolean
  | undefined;

interface MockInfo {
  isHit: boolean;
  mockSetName?: string;
}

/** Normal log structure */
export interface BaseLog {
  label: string;
  source: LogValueType;
  data: LogValueType;
  copyTooltip?: string;
  mockInfo?: MockInfo;
  type: 'input' | 'output' | 'raw_output' | 'batch';
}
/** Log structure for conditions */
export interface ConditionLog {
  conditions: Array<{
    conditions: {
      leftData: LogValueType;
      rightData: LogValueType;
      operatorData: string;
    }[];
    name: string;
    logic: number;
    logicData: string;
  }>;
}

/** Nested log structure */
export interface TreeLog {
  label: string;
  children: (BaseLog | ConditionLog)[];
}

export type Log = BaseLog | ConditionLog | TreeLog;

/** Formatted condition log */
export interface ConditionFormatLog {
  leftData: LogValueType;
  rightData: LogValueType;
  operatorData: string;
}

export interface WorkflowLinkLogData {
  workflowId: string;
  executeId: string;
  subExecuteId: string;
}
