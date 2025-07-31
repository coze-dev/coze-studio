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

import {
  isWebpackChunkError,
  isThirdPartyJsChunkError,
  isCssChunkError,
  isChunkError,
} from '../src/source-error';

describe('bot-error-source-error', () => {
  test('isWebpackChunkError', () => {
    const chunkError = new Error();
    chunkError.name = 'ChunkLoadError';
    expect(isWebpackChunkError(chunkError)).toBeTruthy();
    expect(isChunkError(chunkError)).toBeTruthy();
  });

  test('isThirdPartyJsChunkError', () => {
    const loadingChunkError = new Error();
    loadingChunkError.message = 'Loading chunk xxxx';
    expect(isThirdPartyJsChunkError(loadingChunkError)).toBeTruthy();
    expect(isChunkError(loadingChunkError)).toBeTruthy();
  });

  test('isCssChunkError', () => {
    const cssLoadingChunkError = new Error();
    cssLoadingChunkError.message = 'Loading CSS chunk xxx';
    expect(isCssChunkError(cssLoadingChunkError)).toBeTruthy();
    expect(isChunkError(cssLoadingChunkError)).toBeTruthy();
  });
});
