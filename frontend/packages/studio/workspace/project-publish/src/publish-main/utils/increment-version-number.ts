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

export const incrementVersionNumber = (input: string) => {
  // Define regular expressions that match the pattern of "number. number. number"
  const regex = /(\d+)\.(\d+)\.(\d+)/g;

  // Use the replace method and callback function to replace the matching part
  // eslint-disable-next-line max-params
  const result = input.replace(regex, (_match, p1, p2, p3) => {
    // Add 1 to the last number.
    const incrementedP3 = parseInt(String(p3), 10) + 1;
    // Return a new string
    return `${p1}.${p2}.${incrementedP3}`;
  });

  return result;
};
