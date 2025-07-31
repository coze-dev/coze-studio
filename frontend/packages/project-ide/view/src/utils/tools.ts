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

export function isFunction<T extends (...args: unknown[]) => unknown>(
  value: unknown,
): value is T {
  return typeof value === 'function';
}

function is(userAgent: string, platform: string): boolean {
  if (typeof navigator !== 'undefined') {
    if (navigator.userAgent && navigator.userAgent.indexOf(userAgent) >= 0) {
      return true;
    }
  }
  if (typeof process !== 'undefined') {
    return process.platform === platform;
  }
  return false;
}

export const isWindows = is('Windows', 'win32');
export const isOSX = is('Mac', 'darwin');

export function parseCssMagnitude(
  value: string | null,
  defaultValue: number,
): number;
export function parseCssMagnitude(
  value: string | null,
  defaultValue?: number,
): number | undefined {
  if (value) {
    let parsed: number;
    if (value.endsWith('px')) {
      parsed = parseFloat(value.substring(0, value.length - 2));
    } else {
      parsed = parseFloat(value);
    }
    if (!isNaN(parsed)) {
      return parsed;
    }
  }
  return defaultValue;
}
