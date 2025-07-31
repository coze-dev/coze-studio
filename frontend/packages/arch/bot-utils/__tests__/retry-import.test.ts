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

import { retryImport } from '../src/retry-import';

describe('retry-import tests', () => {
  it('retryImport', async () => {
    const maxRetryCount = 3;
    let maxCount = 0;
    const mockImport = () =>
      new Promise<number>((resolve, reject) => {
        setTimeout(() => {
          if (maxCount >= maxRetryCount) {
            resolve(maxCount);
            return;
          }
          maxCount++;
          reject(new Error('load error!'));
        }, 1000);
      });
    expect(await retryImport<number>(() => mockImport(), maxRetryCount)).toBe(
      3,
    );
  });
});
