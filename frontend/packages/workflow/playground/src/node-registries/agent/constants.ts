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

// 恢复原始路径常量
export const PLATFORM_PATH = 'inputs.platform';
export const AGENT_URL_PATH = 'inputs.agent_url';
export const AGENT_KEY_PATH = 'inputs.agent_key';
export const AGENT_ID_PATH = 'inputs.agent_id';
export const AGENT_BINDING_PATH = 'inputs.agent_binding_id';
export const AGENT_NAME_PATH = 'inputs.agent_name';
export const AGENT_METADATA_PATH = 'inputs.agent_metadata';
export const QUERY_PATH = 'inputs.query';
export const INPUT_PARAMETERS_PATH = 'inputs.inputParameters';
export const DYNAMIC_INPUTS_PATH = 'inputs.dynamicInputs';
export const TIMEOUT_PATH = 'inputs.timeout';
export const RETRY_COUNT_PATH = 'inputs.retry_count';

// 新的装饰器模式路径常量（用于未来）
export const NEW_PLATFORM_PATH = '$$platform_decorator$$.platform';
export const NEW_AGENT_URL_PATH = '$$platform_decorator$$.agent_url';
export const NEW_AGENT_KEY_PATH = '$$platform_decorator$$.agent_key';
export const NEW_QUERY_PATH = '$$prompt_decorator$$.prompt';
export const NEW_INPUT_PARAMETERS_PATH = '$$input_decorator$$.inputParameters';
export const NEW_TIMEOUT_PATH = '$$advanced_decorator$$.timeout';
export const NEW_RETRY_COUNT_PATH = '$$advanced_decorator$$.retry_count';

export const PLATFORM_OPTIONS = [
  { value: 'coze', label: 'Coze 智能体', available: true },
  { value: 'hiagent', label: 'HiAgent 智能体', available: true },
  {
    value: 'dify',
    label: 'Dify 智能体',
    available: false,
    reason: '暂未支持，敬请期待',
  },
  {
    value: 'bailing',
    label: '百灵 智能体',
    available: false,
    reason: '暂未支持，敬请期待',
  },
] as const;

export const DEFAULT_TIMEOUT = 30_000;
export const DEFAULT_RETRY_COUNT = 3;

export const DEFAULT_PLATFORM = 'hiagent';
