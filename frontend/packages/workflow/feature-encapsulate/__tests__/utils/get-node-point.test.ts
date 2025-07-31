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

import { beforeEach, describe, expect, it } from 'vitest';
import {
  WorkflowDocument,
  type WorkflowNodeEntity,
  type WorkflowNodeJSON,
} from '@flowgram-adapter/free-layout-editor';

import { complexMock } from '../workflow.mock';
import { createContainer } from '../create-container';
import { getNodePoint } from '../../src/utils';

describe('get-node-point', () => {
  let workflowDocument: WorkflowDocument;
  beforeEach(() => {
    const container = createContainer();
    workflowDocument = container.get<WorkflowDocument>(WorkflowDocument);
  });

  it('should get empty node point', () => {
    const node: WorkflowNodeJSON = {
      type: 'test',
      id: '1',
    };
    const point = getNodePoint(node);

    expect(point).toEqual({ x: 0, y: 0 });
  });

  it('should get node point by entity', async () => {
    await workflowDocument.fromJSON(complexMock);
    const node = workflowDocument.getNode('900001') as WorkflowNodeEntity;
    const point = getNodePoint(node);
    expect(point).toEqual({ x: 1674.1103135413448, y: 40.63341482104891 });
  });
});
