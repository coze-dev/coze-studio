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

import type { WorkflowNodeEntity } from '@flowgram-adapter/free-layout-editor';

import type { WorkflowCustomDragService } from '@/services';
import type { WorkflowGlobalStateEntity } from '@/typing';

import type {
  WorkflowClipboardNodeJSON,
  WorkflowClipboardSource,
} from '../../type';
import {
  ApiNodeValidator,
  CrossSpaceNodeValidator,
  DropValidator,
  LoopContextValidator,
  NestedLoopBatchValidator,
  SameSpaceValidator,
  SameWorkflowValidator,
  SceneNodeValidator,
  SubWorkflowSelfRefValidator,
} from './validators';
import { ValidationChain } from './validators/validation-chain';

/** Is it a legal node? */
export const isValidNode = (params: {
  node: WorkflowClipboardNodeJSON;
  parent?: WorkflowNodeEntity;
  source: WorkflowClipboardSource;
  globalState: WorkflowGlobalStateEntity;
  dragService: WorkflowCustomDragService;
}): boolean => {
  const validationChain = new ValidationChain();
  validationChain
    // 1. Same space, same workflow
    .setNext(new DropValidator())
    .setNext(new LoopContextValidator())
    .setNext(new NestedLoopBatchValidator())
    .setNext(new SubWorkflowSelfRefValidator())
    // 2. Same space, different workflows
    .setNext(new SameWorkflowValidator())
    .setNext(new SceneNodeValidator())
    // 3. Cross-spatial space
    .setNext(new SameSpaceValidator())
    .setNext(new ApiNodeValidator())
    .setNext(new CrossSpaceNodeValidator());

  return validationChain.run(params);
};
