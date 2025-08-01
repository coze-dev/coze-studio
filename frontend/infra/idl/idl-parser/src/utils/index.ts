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

import { logger } from '@coze-arch/rush-logger';

export const logAndThrowError = (logMessage: string, errorMessage?: string) => {
  logger.error(logMessage);
  const message = errorMessage || logMessage;
  throw new Error(message);
};

export function mergeObject(
  target: { [key: string]: any },
  ...sources: { [key: string]: any }[]
): { [key: string]: any } {
  const newObj = { ...target };
  if (!sources) {
    return newObj;
  }

  for (const source of sources) {
    for (const key of Object.keys(source)) {
      if (typeof source[key] !== 'undefined') {
        newObj[key] = source[key];
      }
    }
  }

  return newObj;
}

export function getPosixPath(filePath: string) {
  return filePath.replace(/\\/g, '/');
}
