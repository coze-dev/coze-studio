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

import semver from 'semver';
import { type BotPluginWorkFlowItem } from '@coze-workflow/components';
import { type ApiNodeDataDTO } from '@coze-workflow/nodes';
import { BlockInput } from '@coze-workflow/base';

import { type McpService, type McpTool } from '@/types/mcp';
import { McpSchemaParser } from '@/utils/mcp-schema-parser';

interface PluginApi {
  name: string;
  plugin_name: string;
  api_id: string;
  plugin_id: string;
  plugin_icon: string;
  desc: string;
  plugin_product_status: number;
  version_name?: string;
  version_ts?: string;
}

export const createApiNodeInfo = (
  apiParams: Partial<PluginApi> | undefined,
  templateIcon?: string,
): ApiNodeDataDTO => {
  const { name, plugin_name, api_id, plugin_id, desc, version_ts } =
    apiParams || {};

  return {
    data: {
      nodeMeta: {
        title: name,
        icon: templateIcon,
        subtitle: `${plugin_name}:${name}`,
        description: desc,
      },
      inputs: {
        apiParam: [
          BlockInput.create('apiID', api_id),
          BlockInput.create('apiName', name),
          BlockInput.create('pluginID', plugin_id),
          BlockInput.create('pluginName', plugin_name),
          BlockInput.create('pluginVersion', version_ts || ''),
          BlockInput.create('tips', ''),
          BlockInput.create('outDocLink', ''),
        ],
      },
    },
  };
};

export const createSubWorkflowNodeInfo = ({
  workflowItem,
  spaceId,
  templateIcon,
  isImageflow,
}: {
  workflowItem: BotPluginWorkFlowItem | undefined;
  spaceId: string;
  isImageflow: boolean;
  templateIcon?: string;
}) => {
  const { name, workflow_id, desc, version_name } = workflowItem || {};

  const nodeJson = {
    data: {
      nodeMeta: {
        title: name,
        description: desc,
        icon: templateIcon,
        isImageflow,
      },
      inputs: {
        workflowId: workflow_id,
        spaceId,
        workflowVersion: semver.valid(version_name) ? version_name : '',
      },
    },
  };

  return nodeJson;
};

export const createMcpNodeInfo = (
  mcpService: McpService,
  tool: McpTool,
  toolRuntimeParams?: Record<string, any>, // 运行时的实际参数值
  templateIcon?: string,
) => {
  // 解析工具的schema以生成动态输入参数
  const parsedSchema = McpSchemaParser.parseToolSchema(tool.schema);
  
  // 根据schema生成工具参数输入 - 直接使用工具参数作为inputParameters
  const inputParameters = parsedSchema.inputParams.map(param => {
    const defaultValue = toolRuntimeParams?.[param.name] !== undefined 
      ? toolRuntimeParams[param.name] 
      : McpSchemaParser.generateDefaultValue(param);
    
    return {
      name: param.name,
      value: defaultValue,
      // 保留参数元信息用于表单渲染
      _mcpParamMeta: {
        type: param.type,
        description: param.description,
        required: param.required,
        schema: param,
      },
    };
  });

  return {
    data: {
      nodeMeta: {
        title: `${mcpService.mcpName} - ${tool.name}`,
        description: tool.description,
        icon: templateIcon,
      },
      inputs: {
        // 工具的动态参数作为标准inputParameters
        inputParameters,
        // MCP元信息用于运行时调用
        mcpMeta: {
          mcpId: mcpService.mcpId,
          mcpName: mcpService.mcpName,
          toolName: tool.name,
          toolSchema: tool.schema,
          toolDescription: tool.description,
          parsedSchema,
        },
      },
    },
  };
};
