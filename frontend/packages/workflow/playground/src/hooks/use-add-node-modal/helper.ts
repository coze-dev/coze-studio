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
import { type ApiNodeDataDTO } from '@coze-workflow/nodes';
import { type BotPluginWorkFlowItem } from '@coze-workflow/components';
import { BlockInput } from '@coze-workflow/base';

import { McpSchemaParser } from '@/utils/mcp-schema-parser';
import { type McpService, type McpTool } from '@/types/mcp';
import { OUTPUTS } from '@/node-registries/mcp/constants';

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
  options?: {
    toolRuntimeParams?: Record<string, unknown>; // 运行时的实际参数值
    currentWorkspaceId?: string; // 动态传入当前工作空间ID
  },
) => {
  const { toolRuntimeParams, currentWorkspaceId } = options || {};
  const templateIcon = undefined; // 使用默认图标
  // 解析工具的schema以生成动态输入参数
  const parsedSchema = McpSchemaParser.parseToolSchema(tool.schema);

  // 创建完整的inputParameters（包含隐藏的MCP配置参数和用户可见的工具参数）
  const inputParameters: ReturnType<typeof BlockInput.create>[] = [];
  
  // 添加隐藏的MCP配置参数（使用特殊前缀，UI会过滤掉）
  inputParameters.push(
    BlockInput.create('__mcp_sassWorkspaceId', currentWorkspaceId || '7533521629687578624'),
    BlockInput.create('__mcp_mcpId', mcpService.mcpId),
    BlockInput.create('__mcp_toolName', tool.name),
  );

  // 🔧 临时添加可见的配置参数用于调试（后续可删除）
  inputParameters.push(
    BlockInput.create('sassWorkspaceId', currentWorkspaceId || '7533521629687578624'),
    BlockInput.create('mcpId', mcpService.mcpId),
    BlockInput.create('toolName', tool.name),
  );

  // 添加工具的实际参数（用户可见可编辑）
  parsedSchema.inputParams.forEach(param => {
    const defaultValue =
      toolRuntimeParams?.[param.name] !== undefined
        ? toolRuntimeParams[param.name]
        : McpSchemaParser.generateDefaultValue(param);

    inputParameters.push(BlockInput.create(param.name, String(defaultValue)));
  });

  // 🚨 关键调试：确认mcpService数据结构和mcpId值
  console.log('🔧 创建MCP节点 - 完整mcpService对象:', mcpService);
  console.log('🔧 创建MCP节点 - mcpId值:', mcpService.mcpId);
  console.log('🔧 创建MCP节点 - mcpId类型:', typeof mcpService.mcpId);
  console.log('🔧 创建MCP节点，参数:', {
    mcpService: mcpService.mcpName,
    tool: tool.name,
    inputParameters: inputParameters.length,
    parsedParams: parsedSchema.inputParams.length,
    currentWorkspaceId,
    mcpServiceId: mcpService.mcpId,
  });

  console.log('🔧 生成的inputParameters:', inputParameters);

  const nodeData = {
    data: {
      nodeMeta: {
        title: tool.name, // 直接使用工具名称
        description: tool.description, // 直接使用工具描述
        icon: templateIcon,
      },
      // 修复：直接在data级别保存inputParameters，而不是嵌套在inputs中
      inputParameters,
      // 添加标准的输出参数定义
      outputs: OUTPUTS,
      // 同时保持inputs结构以确保兼容性
      inputs: {
        inputParameters,
      },
    },
  };

  console.log('🔧 完整的节点数据:', nodeData);

  return nodeData;
};
