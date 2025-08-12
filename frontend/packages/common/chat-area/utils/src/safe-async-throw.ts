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
 * Off-line environment blocking; only exception output and asynchronous errors are thrown after build
 */
export const safeAsyncThrow = (e: string) => {
  const err = new Error(`[chat-area] ${e}`);
  if (IS_DEV_MODE || IS_BOE) {
    throw err;
  }

  setTimeout(() => {
    throw err;
  });
};
