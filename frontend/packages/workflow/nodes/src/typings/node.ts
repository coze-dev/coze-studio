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
 * Plugin扩展协议新增的属性
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
 * 接口 /api/workflow_api/apiDetail 返回的插件数据结构
 * 由于 inputs 和 outputs 等参数类型后端没有定义清楚，这里补充完善下
 */
export type ApiNodeDetailDTO = Required<ApiDetailData> & {
  inputs: (VariableMetaDTO & PluginExtendProps)[]; // name, type, schema, required, description
  outputs: VariableMetaDTO[]; // name, type, schema, required, description
  pluginProductStatus: PluginProductStatus;
  pluginProductUnlistType: ProductUnlistType;
};

/**
 * 插件节点数据部分结构定义后端
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
