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

import { DEFAULT_NODE_META_PATH } from '@coze-workflow/nodes';
import {
  StandardNodeType,
  type WorkflowNodeRegistry,
} from '@coze-workflow/base';

import { type NodeTestMeta } from '@/test-run-kit';

import { test } from './node-test';
import { VARIABLE_ASSIGN_FORM_META } from './form-meta';

export const VARIABLE_ASSIGN_NODE_REGISTRY: WorkflowNodeRegistry<NodeTestMeta> =
  {
    type: StandardNodeType.VariableAssign,
    meta: {
      nodeDTOType: StandardNodeType.VariableAssign,
      style: {
        width: 360,
      },
      size: { width: 360, height: 130.7 },
      nodeMetaPath: DEFAULT_NODE_META_PATH,
      inputParametersPath: '/$$input_decorator$$/inputParameters',
      test,
      helpLink: '/open/docs/guides/variable_assign_node',
    },
    variablesMeta: {
      outputsPathList: [],
      inputsPathList: [],
    },
    formMeta: VARIABLE_ASSIGN_FORM_META,
  };
