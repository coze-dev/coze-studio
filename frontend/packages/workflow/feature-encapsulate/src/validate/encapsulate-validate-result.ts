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

import { injectable } from 'inversify';

import {
  type EncapsulateValidateResult,
  type EncapsulateValidateErrorCode,
  type EncapsulateValidateError,
} from './types';

@injectable()
export class EncapsulateValidateResultImpl
  implements EncapsulateValidateResult
{
  private errors: Map<string, EncapsulateValidateError[]> = new Map();
  addError(error: EncapsulateValidateError) {
    if (!this.errors.has(error.code)) {
      this.errors.set(error.code, []);
    }
    const errors = this.errors.get(error.code);
    if (errors && !errors.some(item => item.source === error.source)) {
      errors.push(error);
    }
  }

  getErrors() {
    return [...this.errors.values()].flat();
  }

  hasError() {
    return this.errors.size > 0;
  }

  hasErrorCode(code: EncapsulateValidateErrorCode) {
    return this.errors.has(code);
  }
}
