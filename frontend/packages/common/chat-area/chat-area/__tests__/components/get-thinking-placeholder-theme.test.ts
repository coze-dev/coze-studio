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

import { getThinkingPlaceholderTheme } from '../../src/utils/components/get-thinking-placeholder-theme';

describe('test get thinking placeholder theme', () => {
  it('not enable UIKit Coze Design', () => {
    const theme = getThinkingPlaceholderTheme({
      bizTheme: 'home',
    });
    expect(theme).toBe('whiteness');
  });

  it('enable UIKit Coze Design', () => {
    const theme1 = getThinkingPlaceholderTheme({
      bizTheme: 'home',
    });
    expect(theme1).toBe('whiteness');
    const theme2 = getThinkingPlaceholderTheme({
      bizTheme: 'debug',
    });
    const theme3 = getThinkingPlaceholderTheme({
      bizTheme: 'store',
    });
    expect(theme2).toBe('grey');
    expect(theme3).toBe('grey');
  });
});
