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
  DEFAULT_OUTPUTS_PATH,
  type WorkflowNodeRegistry,
} from '@coze-workflow/nodes';
import { StandardNodeType } from '@coze-workflow/base';

import { type NodeTestMeta } from '@/test-run-kit';

import { test } from './node-test';
import { DATASET_WRITE_FORM_META } from './form-meta';

export const DATASET_WRITE_NODE_REGISTRY: WorkflowNodeRegistry<NodeTestMeta> = {
  type: StandardNodeType.DatasetWrite,
  meta: {
    nodeDTOType: StandardNodeType.DatasetWrite,
    nodeMetaPath: DEFAULT_NODE_META_PATH,
    style: {
      width: 484,
    },
    size: { width: 484, height: 416 },
    outputsPath: DEFAULT_OUTPUTS_PATH,
    inputParametersPath: '/inputs/inputParameters',
    test,
    helpLink: '/open/docs/guides/knowledge_base_writing_node',
  },
  formMeta: DATASET_WRITE_FORM_META,
};
