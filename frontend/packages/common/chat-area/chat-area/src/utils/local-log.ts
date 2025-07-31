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

let renderLogCount = 1;
const RENDER_TIP_COUNT = 2000;

export const localLog = (...args: unknown[]) => {
  if (!IS_DEV_MODE) {
    return;
  }
  if (renderLogCount % RENDER_TIP_COUNT === 0) {
    console.log(
      `%c🏆 ChatArea render:\t${renderLogCount}次`,
      'background: #fcfaee; padding: 4px; border-radius: 3px;',
    );
  }
  if (String(args?.[0]).includes('render')) {
    renderLogCount += 1;
  }
  // console.debug(...args);
};
