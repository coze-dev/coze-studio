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

import { PlaygroundContext as PlaygroudContextOrigin } from '@flowgram-adapter/free-layout-editor';
import {
  type WorkflowBatchService,
  type WorkflowVariableService,
  type WorkflowVariableValidationService,
} from '@coze-workflow/variable';
import { type StandardNodeType } from '@coze-workflow/base';

import { type WorkflowNodesService } from '../service';
import { type NodeTemplateInfo } from './node';

export const PlaygroundContext = PlaygroudContextOrigin;

export interface PlaygroundContext {
  readonly variableService: WorkflowVariableService;
  readonly batchService: WorkflowBatchService;
  readonly nodesService: WorkflowNodesService;
  readonly variableValidationService: WorkflowVariableValidationService;

  /**
   * Get information by meta type
   * @param type
   */
  getNodeTemplateInfoByType: (
    type: StandardNodeType,
  ) => NodeTemplateInfo | undefined;
  /**
   * Yes No, non-editable mode
   */
  disabled: boolean;
}
