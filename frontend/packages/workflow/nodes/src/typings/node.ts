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
  DTODefine,
  VariableMetaDTO,
  ApiDetailData,
  BlockInput,
} from '@coze-workflow/base';
import type {
  PluginProductStatus,
  ProductUnlistType,
  DebugExample as OriginDebugExample,
} from '@coze-arch/bot-api/developer_api';

export {
  WorkflowNodeVariablesMeta,
  type NodeMeta,
  type WorkflowNodeRegistry,
} from '@coze-workflow/base';

export interface FormNodeMeta {
  title: string;
  icon: string;
  description: string;
  subTitle?: string;
}

export interface NodeTemplateInfo {
  title: string;
  icon: string;
  subTitle: string;
  description: string;
  mainColor: string;
}

export interface ApiNodeIdentifier {
  api_id?: string;
  pluginID: string;
  apiName: string;
  plugin_version?: string;
}

export type DebugExample = OriginDebugExample;

/**
 * Plugin extension protocol added properties
 *
 */
export interface PluginExtendProps {
  title?: string;
  label?: string;
  enum?: string[];
  enumVarNames?: string[];
  minimum?: number;
  maximum?: number;
  exclusiveMinimum?: boolean;
  exclusiveMaximum?: boolean;
  defaultValue?: DTODefine.LiteralExpressionContent;
  bizExtend?: string;
}

/**
 * Plugin data structures returned by interface /api/workflow_api/apiDetail
 * Since the backend of parameter types such as inputs and outputs is not clearly defined, it will be supplemented here.
 */
export type ApiNodeDetailDTO = Required<ApiDetailData> & {
  inputs: (VariableMetaDTO & PluginExtendProps)[]; // name, type, schema, required, description
  outputs: VariableMetaDTO[]; // name, type, schema, required, description
  pluginProductStatus: PluginProductStatus;
  pluginProductUnlistType: ProductUnlistType;
};

/**
 * Plug-in node data part structure definition backend
 */
export interface ApiNodeDataDTO {
  data: {
    nodeMeta: {
      title?: string;
      icon?: string;
      subtitle?: string;
      description?: string;
    };
    inputs: {
      apiParam: BlockInput[];
      inputParameters?: BlockInput[];
      inputDefs?: DTODefine.InputVariableDTO[];
      batch?: {
        batchEnable: boolean;
        batchSize: number;
        concurrentSize: number;
        inputLists: BlockInput[];
      };
      batchMode?: string;
      settingOnError?: {
        switch?: boolean;
        dataOnErr?: string;
      };
    };
    outputs?: VariableMetaDTO[];
  };
}
