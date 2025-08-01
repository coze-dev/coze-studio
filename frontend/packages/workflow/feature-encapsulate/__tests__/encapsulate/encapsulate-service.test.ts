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

import { describe, beforeEach } from 'vitest';
import {
  WorkflowDocument,
  WorkflowSelectService,
  type WorkflowNodeEntity,
} from '@flowgram-adapter/free-layout-editor';

import { complexMock } from '../workflow.mock';
import { createContainer } from '../create-container';
import {
  EncapsulateService,
  type EncapsulateSuccessResult,
} from '../../src/encapsulate';

describe('encapsulate-service', () => {
  let workflowDocument: WorkflowDocument;
  let encapsulateService: EncapsulateService;
  let workflowSelectService: WorkflowSelectService;

  beforeEach(async () => {
    const container = createContainer();
    workflowDocument = container.get<WorkflowDocument>(WorkflowDocument);
    workflowSelectService = container.get<WorkflowSelectService>(
      WorkflowSelectService,
    );
    encapsulateService = container.get<EncapsulateService>(EncapsulateService);

    await workflowDocument.fromJSON(complexMock);
  });

  it('should can encapsulate', () => {
    expect(encapsulateService.canEncapsulate()).toBeTruthy();
  });

  it('should can decapsulate', () => {
    const node = workflowDocument.getNode('102906') as WorkflowNodeEntity;
    expect(encapsulateService.canDecapsulate(node)).toBeTruthy();
  });

  it('should encapsulate nodes', async () => {
    ['102906', '154702'].forEach(id =>
      workflowSelectService.toggleSelect(
        workflowDocument.getNode(id) as WorkflowNodeEntity,
      ),
    );

    const res =
      (await encapsulateService.encapsulate()) as EncapsulateSuccessResult;

    if (!res.success) {
      console.log(res);
    }

    expect(res.success).toBeTruthy();
    expect(res.subFlowNode).toBeDefined();
    expect(res.inputLines.length).toEqual(2);
    res.inputLines.forEach(line => {
      expect(line.to).toBe(res.subFlowNode);
    });
    expect(res.outputLines.length).toEqual(1);
    res.outputLines.forEach(line => {
      expect(line.from).toBe(res.subFlowNode);
    });

    expect(workflowSelectService.selectedNodes.length).toEqual(1);
    expect(workflowSelectService.selectedNodes[0]).toBe(res.subFlowNode);
  });
});
