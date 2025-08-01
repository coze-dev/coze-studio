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

import type {
  WorkflowNodeEntity,
  WorkflowSubCanvas,
} from '@flowgram-adapter/free-layout-editor';
import {
  DEFAULT_NODE_META_PATH,
  DEFAULT_OUTPUTS_PATH,
} from '@coze-workflow/nodes';
import {
  StandardNodeType,
  type WorkflowNodeJSON,
  type WorkflowNodeRegistry,
} from '@coze-workflow/base';

import { type NodeTestMeta } from '@/test-run-kit';

import { test } from './node-test';
import { createLoopFunction, getLoopFunctionID } from './loop-function';
import { LOOP_FORM_META } from './form-meta';
import { LoopPath, LoopSize } from './constants';

export const LOOP_NODE_REGISTRY: WorkflowNodeRegistry<NodeTestMeta> = {
  type: StandardNodeType.Loop,
  meta: {
    nodeDTOType: StandardNodeType.Loop,
    style: {
      width: LoopSize.width,
    },
    size: LoopSize,
    nodeMetaPath: DEFAULT_NODE_META_PATH,
    outputsPath: DEFAULT_OUTPUTS_PATH,
    inputParametersPath: LoopPath.LoopArray, // Imported parameter path, practice running and other functions rely on this path to extract parameters
    useDynamicPort: true,
    defaultPorts: [
      { type: 'input' },
      { type: 'output', portID: 'loop-output' },
      { type: 'output', portID: 'loop-output-to-function', disabled: true },
    ],
    test,
    subCanvas: (node: WorkflowNodeEntity): WorkflowSubCanvas | undefined => {
      const parentNode = node;
      const canvasNodeID = getLoopFunctionID(parentNode.id);
      const canvasNode = node.document.getNode(canvasNodeID);
      if (!canvasNode) {
        return undefined;
      }
      const subCanvas: WorkflowSubCanvas = {
        isCanvas: false,
        parentNode,
        canvasNode,
      };
      return subCanvas;
    },
    helpLink: '/open/docs/guides/loop_node',
  },
  variablesMeta: {
    outputsPathList: [],
    inputsPathList: [
      LoopPath.LoopArray,
      LoopPath.LoopVariables,
      // 'Outputs',//WARNING: Adding outputs will cause this data to be cleared
    ],
  },
  formMeta: LOOP_FORM_META,
  onCreate(node, json) {
    createLoopFunction(node, json as unknown as WorkflowNodeJSON);
  },
};
