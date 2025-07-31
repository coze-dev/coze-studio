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
import { noStateMutation } from './index';

ruleTester.run('no-state-mutation', noStateMutation, {
  valid: [],
  invalid: [
    {
      code: 'const state = useFooStore.getState(); state.foo += 1',
      errors: [
        {
          messageId: 'noStateMutation',
        },
      ],
    },
    {
      code: 'const state = useFooStore.getState(); state.foo.bar.baz = 1',
      errors: [
        {
          messageId: 'noStateMutation',
        },
      ],
    },
    {
      code: 'const { foo: { foo: [{ foo: bar }] }} = useFooStore.getState();bar.bar = 1',
      errors: [
        {
          messageId: 'noStateMutation',
        },
      ],
    },
    {
      code: 'useFooStore.getState().foo.bar.baz = 1',
      errors: [
        {
          messageId: 'noStateMutation',
        },
      ],
    },
    {
      code: 'const state = useFooStore.getState(); const state2 = useBarStore.getState(); const fn = () => () => state.foo.bar.baz = 1',
      errors: [
        {
          messageId: 'noStateMutation',
        },
      ],
    },
  ],
});
