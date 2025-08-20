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

import type { InputValueVO } from '@coze-workflow/base';

/**
 * MCP工具配置表单数据类型
 */
export interface FormData {
  nodeMeta?: {
    title?: string;
    description?: string;
    icon?: string;
  };
  inputs: { inputParameters: InputValueVO[] };
  outputs: Array<{
    key: string;
    name: string;
    type: string;
  }>;
}

/**
 * MCP工具信息
 */
export interface McpTool {
  id: string;
  name: string;
  description: string;
  parameters: McpToolParameter[];
  category?: string;
}

/**
 * MCP工具参数定义
 */
export interface McpToolParameter {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  description?: string;
  required: boolean;
  default?: unknown;
  enum?: unknown[];
  properties?: Record<string, McpToolParameter>;
}

/**
 * MCP工具执行结果
 */
export interface McpToolExecutionResult {
  success: boolean;
  result?: unknown;
  error?: string;
  executionTime?: number;
}

/**
 * MCP API响应类型
 */
export interface McpApiResponse<T = unknown> {
  code: number;
  message: string;
  data: T;
}

/**
 * 工具查询响应数据
 */
export interface McpToolsQueryResult {
  tools: McpTool[];
  total: number;
}
