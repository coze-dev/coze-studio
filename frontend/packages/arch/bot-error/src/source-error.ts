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

export const isWebpackChunkError = (error: Error) =>
  error.name === 'ChunkLoadError';

// Loading chunk 3 failed. (error: )
export const isThirdPartyJsChunkError = (error: Error & { type?: string }) =>
  error.message?.startsWith('Loading chunk');

// Loading CSS chunk 8153 failed. ()
export const isCssChunkError = (error: Error) =>
  error.message?.startsWith('Loading CSS chunk');

export const isChunkError = (error: Error) =>
  isWebpackChunkError(error) ||
  isThirdPartyJsChunkError(error) ||
  isCssChunkError(error);
