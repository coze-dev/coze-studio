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

export class CustomError extends Error {
  constructor(
    public eventName: string,
    public msg: string,
    public ext?: {
      customGlobalErrorConfig?: {
        title?: string;
        subtitle?: string;
      };
    },
  ) {
    super(msg);
    this.name = 'CustomError';
    this.ext = ext;
  }
}
// sladar beforeSend The captured error needs to determine the error type by .name.
export const isCustomError = (error: unknown): error is CustomError =>
  error instanceof CustomError ||
  (error as CustomError)?.name === 'CustomError';
