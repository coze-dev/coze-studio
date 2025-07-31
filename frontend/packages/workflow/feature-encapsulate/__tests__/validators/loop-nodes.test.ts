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

import { describe, it, expect, beforeEach } from 'vitest';
import { StandardNodeType } from '@coze-workflow/base';
import { WorkflowDocument } from '@flowgram-adapter/free-layout-editor';

import { baseMock } from '../workflow.mock';
import { createContainer } from '../create-container';
import {
  EncapsulateValidateErrorCode,
  EncapsulateValidateService,
} from '../../src/validate';

describe('loop-nodes', () => {
  let encapsulateValidateService: EncapsulateValidateService;
  let workflowDocument: WorkflowDocument;
  beforeEach(() => {
    const container = createContainer();
    encapsulateValidateService = container.get<EncapsulateValidateService>(
      EncapsulateValidateService,
    );
    workflowDocument = container.get<WorkflowDocument>(WorkflowDocument);
    workflowDocument.fromJSON(baseMock);
  });

  it('should validate loop nodes error', async () => {
    const breakNode = await workflowDocument.createWorkflowNodeByType(
      StandardNodeType.Break,
    );
    const res = await encapsulateValidateService.validate([breakNode]);

    expect(
      res.hasErrorCode(EncapsulateValidateErrorCode.INVALID_LOOP_NODES),
    ).toBeTruthy();
  });
});
