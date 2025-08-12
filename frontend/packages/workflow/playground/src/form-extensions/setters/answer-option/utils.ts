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

const ASCII_CODE_A = 65; // The ASCII serial number corresponding to the letter A

export function convertNumberToLetters(n) {
  let result = '';
  while (n >= 0) {
    result = String.fromCharCode((n % 26) + ASCII_CODE_A) + result;
    n = Math.floor(n / 26) - 1;
  }
  return result;
}

export const calcPortId = (index: number) => `branch_${index}`;
