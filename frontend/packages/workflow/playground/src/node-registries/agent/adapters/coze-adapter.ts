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

export class CozeAdapter implements PlatformAdapter {
  readonly platform: AgentInputs['platform'] = 'coze';

  validate(_config: AgentInputs): string[] {
    return ['Coze adapter is not yet implemented'];
  }

  buildRequest(_config: AgentInputs): Record<string, unknown> {
    return {};
  }

  parseResponse(_payload: unknown): AgentResponse {
    return {
      answer: '',
    };
  }
}
