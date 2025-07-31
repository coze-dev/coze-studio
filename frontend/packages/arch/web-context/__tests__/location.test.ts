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

import { redirect } from '../src/location';

const viHrefSetter = vi.fn();
vi.stubGlobal('location', {
  _href: '',
  set href(v: string) {
    viHrefSetter(v);
    (this as any)._href = v;
  },
  get href() {
    return (this as any)._href;
  },
});

describe('location', () => {
  test('redirect', () => {
    redirect('test');
    expect(viHrefSetter).toHaveBeenCalledWith('test');
    expect(location.href).equal('test');
  });
});
