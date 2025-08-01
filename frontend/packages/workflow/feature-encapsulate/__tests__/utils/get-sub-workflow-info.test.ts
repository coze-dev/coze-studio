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

import { describe, it, beforeEach, expect } from 'vitest';
import {
  WorkflowDocument,
  type WorkflowNodeEntity,
} from '@flowgram-adapter/free-layout-editor';

import { complexMock } from '../workflow.mock';
import { createContainer } from '../create-container';
import { getSubWorkflowInfo } from '../../src/utils';

describe('get-sub-workflow-info', () => {
  let workflowDocument: WorkflowDocument;
  beforeEach(() => {
    const container = createContainer();
    workflowDocument = container.get<WorkflowDocument>(WorkflowDocument);
  });

  it('should get sub workflow info', async () => {
    await workflowDocument.fromJSON(complexMock);
    expect(
      getSubWorkflowInfo(
        workflowDocument.getNode('102906') as WorkflowNodeEntity,
      ),
    ).toEqual({
      spaceId: 'test_space_id',
      workflowId: 'test_workflow_id',
    });

    expect(
      getSubWorkflowInfo(
        workflowDocument.getNode('154702') as WorkflowNodeEntity,
      ),
    ).toBeUndefined();
  });
});
