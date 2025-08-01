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

import { StandardNodeType } from '@coze-workflow/base/types';
import { type WorkflowJSON } from '@flowgram-adapter/free-layout-editor';

export const baseMock = {
  nodes: [
    {
      id: '1',
      type: StandardNodeType.Start,
    },
    {
      id: '2',
      type: StandardNodeType.End,
    },
  ],
  edges: [],
};

/**
 *  start(100001) -> 154702  -> 102906  -> end(900001)
 *  177547  -> 154702
 *  177547  -> 109408
 */
export const complexMock: WorkflowJSON = {
  nodes: [
    {
      id: '100001',
      type: '1',
      meta: {
        position: {
          x: 180,
          y: 26.700000000000017,
        },
      },
    },
    {
      id: '900001',
      type: '2',
      meta: {
        position: {
          x: 1674.1103135413448,
          y: 40.63341482104891,
        },
      },
    },
    {
      id: '154702',
      type: '3',
      meta: {
        position: {
          x: 918.2411574431025,
          y: 109.52852376445134,
        },
      },
    },
    {
      id: '102906',
      type: StandardNodeType.SubWorkflow,
      data: {
        inputs: {
          spaceId: 'test_space_id',
          workflowId: 'test_workflow_id',
        },
      },
      meta: {
        position: {
          x: 779.2423264779079,
          y: -161.54447093414998,
        },
      },
    },
    {
      id: '177547',
      type: '3',
      meta: {
        position: {
          x: -56.433897883820265,
          y: 221.56518397907752,
        },
      },
    },
    {
      id: '109408',
      type: '3',
      meta: {
        position: {
          x: 1072.169867226058,
          y: 401.6455814216276,
        },
      },
    },
    {
      id: '156471',
      type: '3',
      meta: {
        position: {
          x: 914.727084798963,
          y: 576.5804057333598,
        },
      },
    },
  ],
  edges: [
    {
      sourceNodeID: '102906',
      targetNodeID: '900001',
    },
    {
      sourceNodeID: '100001',
      targetNodeID: '154702',
    },
    {
      sourceNodeID: '177547',
      targetNodeID: '154702',
    },
    {
      sourceNodeID: '154702',
      targetNodeID: '102906',
    },
    {
      sourceNodeID: '177547',
      targetNodeID: '109408',
    },
  ],
};

export const loopJSON: WorkflowJSON = {
  nodes: [
    ...complexMock.nodes,
    {
      id: 'loop_0',
      type: 'loop',
      meta: {
        position: { x: 1200, y: 0 },
      },
      blocks: [
        {
          id: 'break_0',
          type: 'break',
          meta: {
            position: { x: 0, y: 0 },
          },
        },
        {
          id: 'variable_0',
          type: 'variable',
          meta: {
            position: { x: 400, y: 0 },
          },
        },
      ],
      edges: [
        {
          sourceNodeID: 'break_0',
          targetNodeID: 'variable_0',
        },
      ],
    },
  ],
  edges: [...complexMock.edges],
};
