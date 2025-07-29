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
} from '@coze-workflow/nodes';
import {
  StandardNodeType,
  type WorkflowNodeRegistry,
} from '@coze-workflow/base';

import { test, type NodeTestMeta } from './node-test';
import { JSON_STRINGIFY_FORM_META } from './form-meta';
import { INPUT_PATH } from './constants';

export const JSON_STRINGIFY_NODE_REGISTRY: WorkflowNodeRegistry<NodeTestMeta> =
  {
    type: StandardNodeType.JsonStringify,
    meta: {
      nodeDTOType: StandardNodeType.JsonStringify,
      size: { width: 360, height: 130.7 },
      nodeMetaPath: DEFAULT_NODE_META_PATH,
      outputsPath: DEFAULT_OUTPUTS_PATH,
      inputParametersPath: INPUT_PATH,
      test,
    },
    formMeta: JSON_STRINGIFY_FORM_META,
  };
