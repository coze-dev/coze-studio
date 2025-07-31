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

export interface SlardarConfig {
  sessionId?: string;
  [key: string]: unknown;
}

export type SlardarEvents =
  | 'captureException'
  | 'sendEvent'
  | 'sendLog'
  | 'context.set';

export interface Slardar {
  (event: string, params?: Record<string, unknown>): void;
  (
    event: 'captureException',
    error?: Error,
    meta?: Record<string, string>,
    reactInfo?: { version: string; componentStack: string },
  ): void;
  (
    event: 'sendEvent',
    params: {
      name: string;
      metrics: Record<string, number>;
      categories: Record<string, string>;
    },
  ): void;
  (
    event: 'sendLog',
    params: {
      level: string;
      content: string;
      extra: Record<string, string | number>;
    },
  ): void;
  (event: 'context.set', key: string, value: string): void;
  config: (() => SlardarConfig) & ((options: Partial<SlardarConfig>) => void);
  on: (event: string, callback: (...args: unknown[]) => void) => void;
  off: (event: string, callback: (...args: unknown[]) => void) => void;
}

// The slardar instance types that can be used to constrain incoming
export type SlardarInstance = Slardar;

export type { Slardar as default };
