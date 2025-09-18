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

export const PLATFORM_PATH = 'inputs.platform';
export const AGENT_URL_PATH = 'inputs.agent_url';
export const AGENT_KEY_PATH = 'inputs.agent_key';
export const QUERY_PATH = 'inputs.query';
export const DYNAMIC_INPUTS_PATH = 'inputs.dynamicInputs';
export const TIMEOUT_PATH = 'inputs.timeout';
export const RETRY_COUNT_PATH = 'inputs.retry_count';

export const PLATFORM_OPTIONS = [
  { value: 'hiagent', label: 'Hiagent', available: true },
  {
    value: 'dify',
    label: 'Dify',
    available: false,
    reason: '暂未支持，敬请期待',
  },
  {
    value: 'coze',
    label: 'Coze',
    available: false,
    reason: '暂未支持，敬请期待',
  },
] as const;

export const DEFAULT_TIMEOUT = 30_000;
export const DEFAULT_RETRY_COUNT = 3;
