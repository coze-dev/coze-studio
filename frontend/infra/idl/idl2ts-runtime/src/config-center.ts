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

import type { IdlConfig } from './utils';

class ConfigCenter {
  private config: Map<string, IdlConfig> = new Map();
  register(service: string, config: IdlConfig): void {
    this.config.set(service, config);
  }
  getConfig(service: string): IdlConfig | undefined {
    return this.config.get(service);
  }
}

export const configCenter = new ConfigCenter();

export function registerConfig(service: string, config: IdlConfig): void {
  if (configCenter.getConfig(service)) {
    console.warn(
      `${service} api config has already been set,make sure they are the same`,
    );
  }
  configCenter.register(service, config);
}
