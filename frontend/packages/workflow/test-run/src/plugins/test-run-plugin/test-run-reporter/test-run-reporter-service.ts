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

export const TestRunReporterService = Symbol('TestRunReporterService');

export enum EventName {
  TryStart = 'workflow_testrun_sdk_try_start',
  RunEnd = 'workflow_testrun_sdk_run_end',
  /*****************************************************************************
   * Form related
   */
  /** Form schema calculation */
  FormSchemaGen = 'workflow_testrun_sdk_form_schema_gen',
  /** Form UI Pattern */
  FormRunUIMode = 'workflow_testrun_sdk_form_run_ui_mode',
  /** form data filling */
  FormGenDataOrigin = 'workflow_testrun_sdk_form_gen_data_origin',
  /** log related */
  LogOutputDifference = 'workflow_testrun_sdk_log_output_difference',
  LogOutputMarkdown = 'workflow_testrun_sdk_log_output_markdown',
  /** Trace correlation */
  TraceOpen = 'workflow_testrun_sdk_trace_open',
}

interface WorkflowCommonParams {
  space_id?: string;
  project_id?: string;
  workflow_id?: string;
  workflow_mode?: number;
}

export interface Params {
  [EventName.TryStart]: WorkflowCommonParams & {
    scene: 'toolbar' | 'publish' | 'node' | 'form' | 'trigger';
  };
  [EventName.RunEnd]: WorkflowCommonParams & {
    execute_id?: string;
    testrun_type?: 'flow' | 'node' | 'trigger';
    testrun_result?: 'success' | 'fail' | 'cancel' | 'error';
  };
  [EventName.FormSchemaGen]: WorkflowCommonParams & {
    node_type?: string;
    duration: number;
  };
  [EventName.FormRunUIMode]: WorkflowCommonParams & {
    form_ui_mode: 'form' | 'json';
  };
  [EventName.FormGenDataOrigin]: WorkflowCommonParams & {
    gen_data_origin:
      | 'cache'
      | 'testset'
      | 'history'
      | 'ai'
      | 'ai_backup'
      | 'ai_failed';
  };
  [EventName.LogOutputDifference]: WorkflowCommonParams & {
    is_difference: boolean;
    error_msg?: string;
    log_node_type?: string;
  };
  [EventName.LogOutputMarkdown]: WorkflowCommonParams & {
    action_type: 'render' | 'preview';
  };
  [EventName.TraceOpen]: WorkflowCommonParams & {
    panel_type?: 'list' | 'detail';
    log_id?: string;
  };
}

export type PickReporterParams<
  T extends EventName,
  X extends keyof Params[T],
> = Pick<Params[T], X>;

export interface TestRunReporterService {
  /** Log original output similarities and differences analysis */
  logRawOutputDifference: (
    params: Pick<
      Params[EventName.LogOutputDifference],
      'error_msg' | 'log_node_type' | 'is_difference'
    >,
  ) => void;
  /** log Markdown parsing */
  logOutputMarkdown: (
    params: PickReporterParams<EventName.LogOutputMarkdown, 'action_type'>,
  ) => void;
}
