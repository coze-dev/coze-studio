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
  type ValidateErrorData,
  type WorkflowMode,
} from '@coze-workflow/base/';
import { type WorkflowJSON } from '@flowgram-adapter/free-layout-editor';

export interface EncapsulateWorkflowParams {
  name: string;
  desc: string;
  json: WorkflowJSON;
  flowMode: WorkflowMode;
}

export interface EncapsulateApiService {
  /**
   * encapsulation process
   * @param name
   */
  encapsulateWorkflow: (
    params: EncapsulateWorkflowParams,
  ) => Promise<{ workflowId: string } | null>;
  /**
   * Validation Process
   * @param schema
   * @returns
   */
  validateWorkflow: (json: WorkflowJSON) => Promise<ValidateErrorData[]>;
  /**
   * Get process data
   * @param spaceId
   * @param workflowId
   * @returns
   */
  getWorkflow: (
    spaceId: string,
    workflowId: string,
    version?: string,
  ) => Promise<WorkflowJSON | null>;
}

export const EncapsulateApiService = Symbol('EncapsulateApiService');
