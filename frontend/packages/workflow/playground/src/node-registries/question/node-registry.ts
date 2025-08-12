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

import {
  DEFAULT_NODE_META_PATH,
  DEFAULT_NODE_SIZE,
  DEFAULT_OUTPUTS_PATH,
  type WorkflowNodeRegistry,
} from '@coze-workflow/nodes';
import { StandardNodeType } from '@coze-workflow/base';

import { type NodeTestMeta } from '@/test-run-kit';

import { test } from './node-test';
import { QUESTION_FORM_META } from './form-meta';

export const QUESTION_NODE_REGISTRY: WorkflowNodeRegistry<NodeTestMeta> = {
  type: StandardNodeType.Question,
  meta: {
    nodeDTOType: StandardNodeType.Question,
    size: { width: DEFAULT_NODE_SIZE.width, height: 156.7 },
    nodeMetaPath: DEFAULT_NODE_META_PATH,
    outputsPath: DEFAULT_OUTPUTS_PATH,
    useDynamicPort: true,
    inputParametersPath: '/inputParameters',
    getLLMModelIdsByNodeJSON: nodeJSON =>
      nodeJSON?.data?.inputs?.llmParam?.modelType,
    test,
    helpLink: '/open/docs/guides/question_node',
  },
  formMeta: QUESTION_FORM_META,
};
