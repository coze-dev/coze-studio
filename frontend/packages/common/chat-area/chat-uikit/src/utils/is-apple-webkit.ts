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
 * 是否是在苹果平台的Webkit内核浏览器下，
 * 注：这个判断条件不等于是在苹果设备下，因为部分苹果设备（例如Mac）可以运行非原生Webkit引擎的浏览器，例如Chromium(Blink)
 */
export const isAppleWebkit = () =>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  typeof (window as any).webkitConvertPointFromNodeToPage === 'function';
