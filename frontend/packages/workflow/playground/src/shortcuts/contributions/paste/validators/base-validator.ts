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

import type { WorkflowGlobalStateEntity } from '@/typing';
import type { WorkflowCustomDragService } from '@/services';

import type {
  WorkflowClipboardNodeJSON,
  WorkflowClipboardSource,
} from '../../../type';

export interface NodeValidationContext {
  node: WorkflowClipboardNodeJSON;
  source: WorkflowClipboardSource;
  globalState: WorkflowGlobalStateEntity;
  dragService: WorkflowCustomDragService;
  parent?: WorkflowNodeEntity;
}

export interface NodeValidator {
  run: (context: NodeValidationContext) => boolean;
  setNext: (validator: NodeValidator) => NodeValidator;
}

export abstract class BaseNodeValidator implements NodeValidator {
  protected next: NodeValidator | null = null;

  setNext(validator: NodeValidator): NodeValidator {
    this.next = validator;
    return validator;
  }

  run(context: NodeValidationContext): boolean {
    const result = this.validate(context);
    if (result !== null) {
      return result;
    }
    return this.next?.run(context) ?? true;
  }

  protected abstract validate(context: NodeValidationContext): boolean | null;
}
