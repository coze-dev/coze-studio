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

/**
 * Is it under the Webkit kernel browser of the Apple platform?
 * Note: This judgment condition is not equal to under Apple devices, because some Apple devices (such as Mac) can run non-native Webkit engine browsers, such as Chromium (Blink)
 */
export const isAppleWebkit = () =>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  typeof (window as any).webkitConvertPointFromNodeToPage === 'function';
