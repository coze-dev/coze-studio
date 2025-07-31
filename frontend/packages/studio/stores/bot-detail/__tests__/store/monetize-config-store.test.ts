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

import { useMonetizeConfigStore } from '../../src/store/monetize-config-store';
import { useBotDetailStoreSet } from '../../src/store/index';

describe('useMonetizeConfigStore', () => {
  beforeEach(() => {
    useBotDetailStoreSet.clear();
  });
  it('initializes with default state', () => {
    const initialState = useMonetizeConfigStore.getState();
    expect(initialState.isOn).toBe(false);
    expect(initialState.freeCount).toBe(0);
  });
  it('sets isOn state correctly', () => {
    const { setIsOn } = useMonetizeConfigStore.getState();
    setIsOn(true);
    expect(useMonetizeConfigStore.getState().isOn).toBe(true);
  });
  it('sets freeCount state correctly', () => {
    const { setFreeCount } = useMonetizeConfigStore.getState();
    setFreeCount(10);
    expect(useMonetizeConfigStore.getState().freeCount).toBe(10);
  });
  it('initializes store with provided data', () => {
    const { initStore } = useMonetizeConfigStore.getState();
    initStore({ is_enable: true, free_chat_allowance_count: 5 });
    expect(useMonetizeConfigStore.getState().isOn).toBe(true);
    expect(useMonetizeConfigStore.getState().freeCount).toBe(5);
  });
  it('resets store to default state', () => {
    const { reset } = useMonetizeConfigStore.getState();
    const { setIsOn } = useMonetizeConfigStore.getState();
    const { setFreeCount } = useMonetizeConfigStore.getState();

    setIsOn(true);
    setFreeCount(10);
    reset();

    const stateAfterReset = useMonetizeConfigStore.getState();
    expect(stateAfterReset.isOn).toBe(false);
    expect(stateAfterReset.freeCount).toBe(0);
  });
  it('handles undefined values in initialization gracefully', () => {
    const { initStore } = useMonetizeConfigStore.getState();
    initStore({ is_enable: undefined, free_chat_allowance_count: undefined });
    expect(useMonetizeConfigStore.getState().isOn).toBe(true);
    expect(useMonetizeConfigStore.getState().freeCount).toBe(0);
  });
});
