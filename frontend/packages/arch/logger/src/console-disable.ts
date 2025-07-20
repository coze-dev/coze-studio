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
 
// import { runtimeEnv } from '@coze-arch/bot-env/runtime';
const DEBUG_TAG = 'open_debug';
const OPEN_CONSOLE_MARK = new RegExp(`(?:\\?|\\&)${DEBUG_TAG}=true`);

export const shouldCloseConsole = () => {
  // 如果URL带有调试开启标记，则允许console打开
  const { search } = window.location;
  let isOpenDebug = !!sessionStorage.getItem(DEBUG_TAG);
  if (!isOpenDebug) {
    isOpenDebug = OPEN_CONSOLE_MARK.test(search);
    isOpenDebug && sessionStorage.setItem(DEBUG_TAG, 'true');
  }
  // 除了正式正常环境都允许console打开
  const isProduction = !!(IS_RELEASE_VERSION );
  console.log('IS_RELEASE_VERSION', IS_RELEASE_VERSION, isProduction);
  return !isOpenDebug && isProduction;
};
