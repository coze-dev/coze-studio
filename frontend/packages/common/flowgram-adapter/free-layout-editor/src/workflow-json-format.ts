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
  type WorkflowJSON,
  type WorkflowDocument,
  type WorkflowNodeJSON,
  type WorkflowNodeEntity,
} from '@flowgram.ai/free-layout-core';

/**
 * Global data transformation
 */
export interface WorkflowJSONFormatContribution {
  /**
   * Called during data initialization
   */
  formatOnInit?: (json: WorkflowJSON, doc: WorkflowDocument) => WorkflowJSON;
  /**
   * Called when data is submitted
   */
  formatOnSubmit?: (json: WorkflowJSON, doc: WorkflowDocument) => WorkflowJSON;
  /**
   * Transform node initialization data
   * @param data
   * Parameters initialized by @param
   */
  formatNodeOnInit?: (
    data: WorkflowNodeJSON,
    doc: WorkflowDocument,
    isClone?: boolean,
  ) => WorkflowNodeJSON;
  /**
   * Unified conversion form submission data
   * @param data
   */
  formatNodeOnSubmit?: (
    data: WorkflowNodeJSON,
    doc: WorkflowDocument,
    node: WorkflowNodeEntity,
  ) => WorkflowNodeJSON;
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export const WorkflowJSONFormatContribution = Symbol(
  'WorkflowJSONFormatContribution',
);
