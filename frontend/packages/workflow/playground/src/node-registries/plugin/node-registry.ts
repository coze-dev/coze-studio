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
  DEFAULT_BATCH_PATH,
  type ApiNodeDataDTO,
} from '@coze-workflow/nodes';
import {
  StandardNodeType,
  type WorkflowNodeJSON,
  type WorkflowNodeRegistry,
} from '@coze-workflow/base';

import { type WorkflowPlaygroundContext } from '@/workflow-playground-context';
import { type NodeTestMeta } from '@/test-run-kit';
import { PluginNodeService } from '@/services';

import { getApiNodeIdentifier } from './utils';
import { type ApiNodeFormData } from './types';
import { test } from './node-test';
import { PLUGIN_FORM_META } from './form-meta';
import {
  INPUT_PARAMS_PATH,
  NOT_FREE_PLUGINS_APINAME_DOC_MAP,
} from './constants';
import { createPluginLink } from './components/plugin-link';

type ApiNodeData = WorkflowNodeJSON<ApiNodeDataDTO['data']>;

const getPluginNodeService = (context: WorkflowPlaygroundContext) =>
  context.entityManager.getService<PluginNodeService>(PluginNodeService);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getApiDetailApiParam = (nodeJson: any) =>
  nodeJson.data?.inputs?.apiParam || nodeJson?.inputs?.apiParam || [];

export const PLUGIN_NODE_REGISTRY: WorkflowNodeRegistry<NodeTestMeta> = {
  type: StandardNodeType.Api,
  meta: {
    nodeDTOType: StandardNodeType.Api,
    size: { width: 360, height: 130.7 },
    nodeMetaPath: DEFAULT_NODE_META_PATH,
    outputsPath: DEFAULT_OUTPUTS_PATH,
    batchPath: DEFAULT_BATCH_PATH,
    inputParametersPath: INPUT_PARAMS_PATH, // Imported parameter path, practice running and other functions rely on this path to extract parameters
    test,
    helpLink: ({ apiName }) =>
      NOT_FREE_PLUGINS_APINAME_DOC_MAP[apiName] ||
      '/open/docs/guides/plugin_node',
  },
  formMeta: PLUGIN_FORM_META,

  onInit: async (nodeJson, context: WorkflowPlaygroundContext) => {
    if (!nodeJson) {
      return;
    }

    const pluginService = getPluginNodeService(context);
    const identifier = getApiNodeIdentifier(
      getApiDetailApiParam(nodeJson as ApiNodeData),
    );
    await pluginService.load(identifier);
  },

  checkError: (nodeJson, context: WorkflowPlaygroundContext) => {
    if (!nodeJson) {
      return undefined;
    }
    const pluginService = getPluginNodeService(context);
    const identifier = getApiNodeIdentifier(
      getApiDetailApiParam(nodeJson as ApiNodeData),
    );
    return pluginService.getApiError(identifier);
  },

  getHeaderExtraOperation: (formValues: ApiNodeFormData) => {
    const identifier = getApiNodeIdentifier(formValues?.inputs?.apiParam ?? []);
    return createPluginLink(identifier);
  },

  onDispose: (nodeJson, context: WorkflowPlaygroundContext) => {
    if (!nodeJson) {
      return;
    }
    const pluginService = getPluginNodeService(context);
    const identifier = getApiNodeIdentifier(
      getApiDetailApiParam(nodeJson as ApiNodeData),
    );
    pluginService.clearApiError(identifier);
  },
};
