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

import './setup-vitest';
import { useSignMobileStore } from '../src/store';

describe('useSignMobileStore', () => {
  it('should init with default state', () => {
    const state = useSignMobileStore.getState();
    expect(state.mobileTips).toEqual(false);
  });

  it('setMobileTips', () => {
    useSignMobileStore.getState().setMobileTips(true);
    expect(useSignMobileStore.getState().mobileTips).toEqual(true);
  });
});
