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
import { cloneDeep } from 'lodash-es';
import {
  WorkflowDocument,
  type WorkflowNodeEntity,
} from '@flowgram-adapter/free-layout-editor';

import { complexMock } from '../workflow.mock';
import { createContainer } from '../create-container';
import {
  EncapsulateLinesService,
  EncapsulateNodesService,
} from '../../src/encapsulate';

describe('encapsulate-lines-service', () => {
  let workflowDocument: WorkflowDocument;
  let encapsulateNodesService: EncapsulateNodesService;
  let encapsulateLinesService: EncapsulateLinesService;

  beforeEach(() => {
    const container = createContainer();
    workflowDocument = container.get<WorkflowDocument>(WorkflowDocument);
    encapsulateLinesService = container.get<EncapsulateLinesService>(
      EncapsulateLinesService,
    );
    encapsulateNodesService = container.get<EncapsulateNodesService>(
      EncapsulateNodesService,
    );
  });

  it('should create empty decapsulate lines', async () => {
    await workflowDocument.fromJSON(complexMock);
    const { inputLines, outputLines } =
      encapsulateLinesService.createDecapsulateLines({
        node: workflowDocument.getNode('102906') as WorkflowNodeEntity,
        workflowJSON: {
          edges: [],
          nodes: [],
        },
        startNodeId: '',
        endNodeId: '',
        idsMap: new Map(),
      });
    expect(inputLines).toEqual([]);
    expect(outputLines).toEqual([]);
  });

  // The unblocking node has multiple inputs, and the unblocking process start node has multiple outputs, so an input connection cannot be created
  it('should not create decapsulate input lines', async () => {
    const json = {
      ...cloneDeep(complexMock),
      edges: [
        ...complexMock.edges,
        {
          sourceNodeID: '100001',
          targetNodeID: '177547',
        },
      ],
    };
    await workflowDocument.fromJSON(json);

    const sourceNode = workflowDocument.getNode('154702') as WorkflowNodeEntity;

    const { idsMap, startNode, endNode } =
      await encapsulateNodesService.createDecapsulateNodes(
        sourceNode,
        json.nodes,
      );

    const { inputLines } = encapsulateLinesService.createDecapsulateLines({
      node: sourceNode,
      workflowJSON: {
        nodes: [],
        edges: json.edges,
      },
      startNodeId: startNode.id,
      endNodeId: endNode.id,
      idsMap,
    });

    expect(inputLines).toEqual([]);
  });

  // The unblocking node has multiple outputs, and the unblocking process end node has multiple inputs, so an output connection cannot be created
  it('should not create decapsulate output lines', async () => {
    const json = {
      ...cloneDeep(complexMock),
      edges: [
        ...complexMock.edges,
        {
          sourceNodeID: '109408',
          targetNodeID: '900001',
        },
      ],
    };
    await workflowDocument.fromJSON(json);

    const sourceNode = workflowDocument.getNode('177547') as WorkflowNodeEntity;

    const { idsMap, startNode, endNode } =
      await encapsulateNodesService.createDecapsulateNodes(
        sourceNode,
        json.nodes,
      );

    const { outputLines } = encapsulateLinesService.createDecapsulateLines({
      node: sourceNode,
      workflowJSON: {
        nodes: [],
        edges: json.edges,
      },
      startNodeId: startNode.id,
      endNodeId: endNode.id,
      idsMap,
    });

    expect(outputLines).toEqual([]);
  });

  it('should create decapsulate lines', async () => {
    await workflowDocument.fromJSON(cloneDeep(complexMock));

    const sourceNode = workflowDocument.getNode('102906') as WorkflowNodeEntity;
    const { idsMap, startNode, endNode } =
      await encapsulateNodesService.createDecapsulateNodes(
        sourceNode,
        complexMock.nodes,
      );
    const { inputLines, outputLines, internalLines } =
      encapsulateLinesService.createDecapsulateLines({
        node: sourceNode,
        workflowJSON: {
          nodes: [],
          edges: complexMock.edges,
        },
        startNodeId: startNode.id,
        endNodeId: endNode.id,
        idsMap,
      });

    expect(internalLines.length).toEqual(3);
    expect(inputLines.length).toEqual(1);
    expect(outputLines.length).toEqual(1);
  });
});
