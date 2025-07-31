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

import { type WorkflowJSON } from '@flowgram-adapter/free-layout-editor';
import { StandardNodeType } from '@coze-workflow/base/types';

import {
  allEndRefInputs,
  genInput,
  mockFullOutputs,
  mockRefInputs,
  mockMergeGroup,
} from './variable.mock';

/**
 *  start(start) -> llm_0  -> variable_merge_0  -> end(end)
 *  llm_2  -> llm_0
 *  llm_2  -> llm_3
 */
export const complexMock: WorkflowJSON = {
  nodes: [
    {
      id: 'start',
      type: StandardNodeType.Start,
      meta: {
        position: {
          x: 180,
          y: 26.700000000000017,
        },
      },
      data: {
        outputs: mockFullOutputs,
      },
    },
    {
      id: 'end',
      type: StandardNodeType.End,
      meta: {
        position: {
          x: 1674.1103135413448,
          y: 40.63341482104891,
        },
      },
      data: {
        inputParameters: allEndRefInputs,
      },
    },
    {
      id: 'llm_0',
      type: StandardNodeType.LLM,
      meta: {
        position: {
          x: 918.2411574431025,
          y: 109.52852376445134,
        },
      },
      data: {
        inputParameters: mockRefInputs,
        outputs: mockFullOutputs,
      },
    },
    {
      id: 'merge_0',
      type: StandardNodeType.VariableMerge,
      data: {
        groups: mockMergeGroup,
      },
      meta: {
        position: {
          x: 779.2423264779079,
          y: -161.54447093414998,
        },
      },
    },
    {
      id: 'llm_2',
      type: StandardNodeType.LLM,
      meta: {
        position: {
          x: -56.433897883820265,
          y: 221.56518397907752,
        },
      },
    },
    {
      id: 'llm_3',
      type: StandardNodeType.LLM,
      meta: {
        position: {
          x: 1072.169867226058,
          y: 401.6455814216276,
        },
      },
    },
    {
      id: '156471',
      type: StandardNodeType.LLM,
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
      sourceNodeID: 'variable_merge_0',
      targetNodeID: 'end',
    },
    {
      sourceNodeID: 'start',
      targetNodeID: 'llm_0',
    },
    {
      sourceNodeID: 'llm_2',
      targetNodeID: 'llm_0',
    },
    {
      sourceNodeID: 'llm_0',
      targetNodeID: 'variable_merge_0',
    },
    {
      sourceNodeID: 'llm_2',
      targetNodeID: 'llm_3',
    },
  ],
};

export const loopJSON: WorkflowJSON = {
  nodes: [
    ...complexMock.nodes,
    {
      id: 'loop_0',
      type: StandardNodeType.Loop,
      meta: {
        position: { x: 1200, y: 0 },
      },
      data: {
        inputs: {
          inputParameters: mockRefInputs.map(_input => ({
            ..._input,
            name: `loop_batch_${_input.name}`,
          })),
          variableParameters: mockRefInputs.map(_input => ({
            ..._input,
            name: `loop_var_${_input.name}`,
          })),
        },
        outputs: [
          genInput('loop_output_var_string', [
            'loop_0',
            'loop_var_llm_0__Object',
          ]),
          genInput('loop_output_string', ['llm_in_loop_0', 'String']),
          genInput('loop_output_image', ['llm_in_loop_0', 'Object', 'Image']),
        ],
      },
      blocks: [
        {
          id: 'llm_in_loop_0',
          type: StandardNodeType.LLM,
          meta: {
            position: { x: 400, y: 0 },
          },
          data: {
            outputs: mockFullOutputs,
          },
        },
        {
          id: 'llm_in_loop_1',
          type: StandardNodeType.LLM,
          meta: {
            position: { x: 500, y: 0 },
          },
        },
      ],
      edges: [
        {
          sourceNodeID: 'llm_in_loop_0',
          targetNodeID: 'llm_in_loop_1',
        },
      ],
    },
  ],
  edges: [
    ...complexMock.edges,
    {
      sourceNodeID: 'llm_0',
      targetNodeID: 'loop_0',
    },
    {
      sourceNodeID: 'loop_0',
      targetNodeID: 'end',
    },
  ],
};
