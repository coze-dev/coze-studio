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

import {
  exhaustiveCheckSimple,
  exhaustiveCheckForRecord,
} from '../src/exhaustive-check';

it('works', () => {
  const obj = { a: 1 };
  // eslint-disable-next-line @typescript-eslint/no-unused-vars,no-unused-vars -- .
  const { a, ...rest } = obj;
  exhaustiveCheckForRecord(rest);
  type N = 1;
  const n: N = 1;
  switch (n) {
    case 1:
      break;
    default:
      exhaustiveCheckSimple(n);
  }
});
