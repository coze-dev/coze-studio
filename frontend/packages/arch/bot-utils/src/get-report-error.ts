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

import { isObject } from 'lodash-es';

/**
 * @param inputError can pass anything, usually catch (e) that e.
 * @param reason explanation
 */
export const getReportError = (
  inputError: unknown,
  reason?: string,
): {
  error: Error;
  meta: Record<string, unknown>;
} => {
  if (inputError instanceof Error) {
    return {
      error: inputError,
      meta: { reason },
    };
  }
  if (!isObject(inputError)) {
    return {
      error: new Error(String(inputError)),
      meta: { reason },
    };
  }
  return {
    error: new Error(''),
    meta: { ...covertInputObject(inputError), reason },
  };
};

const covertInputObject = (inputError: object) => {
  if ('reason' in inputError) {
    return {
      ...inputError,
      reasonOfInputError: inputError.reason,
    };
  }
  return inputError;
};
