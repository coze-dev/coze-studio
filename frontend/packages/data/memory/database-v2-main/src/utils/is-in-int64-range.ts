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

// The maximum and minimum values of int64
export const INT64_MAX = BigInt('9223372036854775807');
export const INT64_MIN = BigInt('-9223372036854775808');

/**
 * Check if the value is in the int64 range
 * @Param value - string to check
 * @returns
 *  If it is a valid integer in the int64 range, return true.
 *  If invalid or out of range, return false
 */
export const isInInt64Range = (value: string): boolean => {
  if (
    value === '' ||
    value === undefined ||
    value === null ||
    Number.isNaN(value)
  ) {
    return false;
  }

  try {
    const bigIntValue = BigInt(value);
    if (bigIntValue > INT64_MAX || bigIntValue < INT64_MIN) {
      return false;
    }
    return true;
    // eslint-disable-next-line @coze-arch/use-error-in-catch -- normal business logic
  } catch {
    return false;
  }
};
