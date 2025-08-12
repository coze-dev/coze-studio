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

import type { CSSProperties } from 'react';

import type { SetterComponentProps } from '@flowgram-adapter/free-layout-editor';
import type { WorkflowNodeEntity } from '@flowgram-adapter/free-layout-editor';
import type { RefExpression } from '@coze-workflow/base';

export type NodeInputNameFormat = (params: {
  name: string;
  prefix: string;
  suffix: string;
  input: RefExpression;
  node: WorkflowNodeEntity;
}) => string;

export type NodeInputNameProps = SetterComponentProps & {
  readonly?: boolean;
  initValidate?: boolean;
  isPureText?: boolean;
  style?: CSSProperties;
  /** Variable expressions at the same level */
  input?: RefExpression;
  /** All input items in the current input list */
  inputParameters?: Array<{
    name: string;
    input: RefExpression;
  }>;
  /** prefix */
  prefix?: string;
  /** suffix */
  suffix?: string;
  /** Name custom formatting */
  format?: NodeInputNameFormat;
  tooltip?: string;
};
