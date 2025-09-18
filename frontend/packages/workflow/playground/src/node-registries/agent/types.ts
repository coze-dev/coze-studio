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

import { type InputValueVO, type NodeDataDTO } from '@coze-workflow/base';

import { type PLATFORM_OPTIONS } from './constants';

export type AgentPlatformValue = (typeof PLATFORM_OPTIONS)[number]['value'];

export interface AgentPlatformOption {
  value: AgentPlatformValue;
  label: string;
  available: boolean;
  reason?: string;
}

export interface AgentConfig {
  agent_url: string;
  agent_key?: string;
}

export interface AgentAdvancedConfig {
  timeout: number;
  retry_count: number;
}

export interface AgentInputs extends AgentConfig, AgentAdvancedConfig {
  platform: AgentPlatformValue;
  query: string;
  dynamicInputs: InputValueVO[];
}

export interface AgentFormData extends Omit<NodeDataDTO, 'inputs'> {
  inputs: Partial<AgentInputs> & {
    platform: AgentPlatformValue;
    agent_url: string;
    query: string;
    dynamicInputs: InputValueVO[];
  };
}
