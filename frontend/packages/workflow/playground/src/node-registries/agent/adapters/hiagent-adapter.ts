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

import { type AgentInputs } from '../types';
import { type AgentResponse, type PlatformAdapter } from './base-adapter';

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

export class HiagentAdapter implements PlatformAdapter {
  readonly platform: AgentInputs['platform'] = 'hiagent';

  validate(config: AgentInputs): string[] {
    const errors: string[] = [];
    if (!config.agent_url?.trim()) {
      errors.push('Agent URL is required');
    }
    if (!config.query?.trim()) {
      errors.push('Query is required');
    }
    try {
      if (config.agent_url) {
        new URL(config.agent_url);
      }
    } catch (error) {
      errors.push('Invalid Agent URL');
    }
    return errors;
  }

  buildRequest(config: AgentInputs) {
    return {
      url: config.agent_url,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(config.agent_key
          ? { Authorization: `Bearer ${config.agent_key}` }
          : {}),
      },
      body: {
        query: config.query,
        inputs: (config.dynamicInputs ?? []).reduce<Record<string, unknown>>(
          (acc, cur) => {
            if (cur?.name) {
              acc[cur.name] = cur?.input;
            }
            return acc;
          },
          {},
        ),
      },
      timeout: config.timeout,
      retryTimes: config.retry_count,
    };
  }

  parseResponse(payload: unknown): AgentResponse {
    if (isRecord(payload)) {
      const { answer, metadata } = payload;
      const metadataRecord = isRecord(metadata) ? metadata : undefined;
      return {
        answer: typeof answer === 'string' ? answer : '',
        metadata: metadataRecord ? { ...metadataRecord } : undefined,
      };
    }
    return {
      answer: '',
    };
  }
}
