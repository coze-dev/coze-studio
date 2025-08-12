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

import {
  type Log,
  type ConditionLog,
  type OutputLog,
  type BaseLog,
  type FunctionCallLog,
  type WorkflowLinkLog,
} from '../types';
import { LogType } from '../constants';

/** Is it an output log? */
export const isOutputLog = (log: Log): log is OutputLog =>
  log.type === LogType.Output;

/** Is it condition input? */
export const isConditionLog = (log: Log): log is ConditionLog =>
  log.type === LogType.Condition;

/** Is it a large model inference log? */
export const isReasoningLog = (log: Log): log is BaseLog =>
  log.type === LogType.Reasoning;

export const isFunctionCallLog = (log: Log): log is FunctionCallLog =>
  log.type === LogType.FunctionCall;

/** Is it a subprocess jump connection? */
export const isWorkflowLinkLog = (log: Log): log is WorkflowLinkLog =>
  log.type === LogType.WorkflowLink;
