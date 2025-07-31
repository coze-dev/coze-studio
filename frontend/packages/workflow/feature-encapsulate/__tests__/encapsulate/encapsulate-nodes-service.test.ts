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

import { describe, beforeEach, it, expect } from 'vitest';
import { FlowNodeTransformData } from '@flowgram-adapter/free-layout-editor';
import {
  WorkflowDocument,
  type WorkflowNodeEntity,
} from '@flowgram-adapter/free-layout-editor';

import { complexMock } from '../workflow.mock';
import { createContainer } from '../create-container';
import { EncapsulateNodesService } from '../../src/encapsulate';

describe('encapsulate-nodes-service', () => {
  let workflowDocument: WorkflowDocument;
  let encapsulateNodesService: EncapsulateNodesService;

  beforeEach(() => {
    const container = createContainer();
    workflowDocument = container.get<WorkflowDocument>(WorkflowDocument);
    encapsulateNodesService = container.get<EncapsulateNodesService>(
      EncapsulateNodesService,
    );
  });

  it('should getNodesMiddlePoint', async () => {
    await workflowDocument.fromJSON(complexMock);

    const nodes = ['109408', '156471'].map(id =>
      workflowDocument.getNode(id),
    ) as WorkflowNodeEntity[];
    const point = encapsulateNodesService.getNodesMiddlePoint(nodes);

    expect(point).toEqual({
      x: 993.4484760125105,
      y: 489.11299357749374,
    });
  });

  it('should getNodesMiddlePoint by json', () => {
    const point = encapsulateNodesService.getNodesMiddlePoint(
      complexMock.nodes,
    );

    expect(point).toEqual({
      x: 808.8382078287623,
      y: 207.51796739960494,
    });
  });

  it('should createDecapsulateNode', async () => {
    await workflowDocument.fromJSON(complexMock);
    const json = {
      id: '1',
      type: 'test',
      meta: {
        position: {
          x: 0,
          y: 0,
        },
      },
      blocks: [
        {
          id: '2',
          type: 'test',
          meta: {
            position: {
              x: 5,
              y: 6,
            },
          },
        },
      ],
    };

    const idsMap = new Map<string, string>();
    const node = await encapsulateNodesService.createDecapsulateNode(
      json,
      {
        x: 170,
        y: 16.700000000000017,
      },
      idsMap,
    );
    expect(node.id).not.toBe('1');
    expect(node.flowNodeType).toBe(json.type);
    const transformData = node.getData(FlowNodeTransformData);
    expect(transformData.position).toEqual({ x: 170, y: 16.700000000000017 });

    const child = node.collapsedChildren[0];
    expect(child.id).not.toBe('2');
    expect(child.flowNodeType).toBe(json.blocks[0].type);
    const childTransformData = child.getData(FlowNodeTransformData);
    expect(childTransformData.position).toEqual({
      x: 175,
      y: 22.700000000000017,
    });

    expect(idsMap.get('1')).toBe(node.id);
    expect(idsMap.get('2')).toBe(child.id);
  });

  it('should decapsulateLayout', async () => {
    await workflowDocument.fromJSON(complexMock);
    await encapsulateNodesService.decapsulateLayout(
      workflowDocument.getNode('100001') as WorkflowNodeEntity,
      [complexMock.nodes[1], complexMock.nodes[2], complexMock.nodes[3]],
    );
    const json = await workflowDocument.toJSON();
    expect(json).toMatchSnapshot();
  });
});
