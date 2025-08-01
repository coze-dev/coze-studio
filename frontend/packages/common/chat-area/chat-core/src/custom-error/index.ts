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

export interface ExtErrorInfo {
  code?: number;
  local_message_id?: string;
  reply_id?: string;
  logId?: string;
  rawError?: unknown;
}
export class ChatCoreError extends Error {
  ext: ExtErrorInfo;
  constructor(message: string, ext?: ExtErrorInfo) {
    super(message);
    this.name = 'chatCoreError';
    this.ext = ext || {};
  }

  /**
   * Flatten error messages for easy filtering of error messages in slardar
   */
  flatten = () => {
    const { message, ext } = this;
    return {
      message,
      ...ext,
    };
  };
}
