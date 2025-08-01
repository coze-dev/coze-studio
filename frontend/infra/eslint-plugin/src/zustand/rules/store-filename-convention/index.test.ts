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

import { ruleTester } from '../tester';
import { storeFilenameConvention } from './index';

const code = "import { create } from 'zustand'; const store = create()() ";

ruleTester.run('store-filename-convention', storeFilenameConvention, {
  valid: [
    {
      code,
      filename: 'foo-store.ts',
    },
    {
      code,
      filename: 'fooStore.ts',
    },
  ],
  invalid: [
    {
      code,
      filename: 'store.ts',
      errors: [{ messageId: 'nameConvention' }],
    },
    {
      code,
      filename: 'foo.ts',
      errors: [{ messageId: 'nameConvention' }],
    },
  ],
});
