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

import { nanoid } from 'nanoid';
// 定义变量类型
const VIEW_VARIABLE_TYPE = {
  Object: 'object',
  Boolean: 'boolean',
  String: 'string',
} as const;

// 输入参数路径，试运行等功能依赖此路径提取参数
export const INPUT_PATH = 'inputs.inputParameters';

// 定义固定输出参数
export const OUTPUTS = [
  {
    key: nanoid(),
    name: 'result',
    type: VIEW_VARIABLE_TYPE.Object,
  },
  {
    key: nanoid(),
    name: 'success',
    type: VIEW_VARIABLE_TYPE.Boolean,
  },
  {
    key: nanoid(),
    name: 'error',
    type: VIEW_VARIABLE_TYPE.String,
  },
];

// 默认输入参数
export const DEFAULT_INPUTS = [{ name: 'tool_name' }, { name: 'parameters' }];

// MCP工具超时设置（毫秒）
export const DEFAULT_TIMEOUT = 30000;

// MCP API端点
export const MCP_API_ENDPOINTS = {
  queryTools: '/aop-web/mcp/qryTools',
  executeTool: '/aop-web/mcp/executeTool',
};
