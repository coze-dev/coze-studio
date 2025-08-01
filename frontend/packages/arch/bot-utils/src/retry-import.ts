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

// TODO: https://github.com/web-infra-dev/rsbuild/issues/91
export const retryImport = <T>(
  importFunction: () => Promise<T>,
  maxRetryCount = 3,
) => {
  let maxCount = 0;
  const loadWithRetry = (): Promise<T> =>
    new Promise((resolve, reject) => {
      importFunction().then(
        res => resolve(res),
        error => {
          if (maxCount >= maxRetryCount) {
            reject(error);
          } else {
            maxCount++;
            resolve(loadWithRetry());
          }
        },
      );
    });
  return loadWithRetry();
};
