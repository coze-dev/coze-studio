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

import { useQueryCollectStore } from '../../src/store/query-collect';

describe('useQueryCollectStore', () => {
  beforeEach(() => {
    useQueryCollectStore.getState().clear();
  });

  it('initializes with default values', () => {
    const state = useQueryCollectStore.getState();
    expect(state.is_collected).toBe(false);
    expect(state.private_policy).toBe('');
  });

  it('sets query collect state correctly', () => {
    const { setQueryCollect } = useQueryCollectStore.getState();
    setQueryCollect({ is_collected: true, private_policy: 'Test policy' });
    const state = useQueryCollectStore.getState();
    expect(state.is_collected).toBe(true);
    expect(state.private_policy).toBe('Test policy');
  });

  it('transforms DTO to VO correctly', () => {
    const botData = {
      bot_info: {
        user_query_collect_conf: {
          is_collected: true,
          private_policy: 'Some policy',
        },
      },
    } as const;
    const result = useQueryCollectStore.getState().transformDto2Vo(botData);
    expect(result).toMatchObject({
      is_collected: true,
      private_policy: 'Some policy',
    });
  });

  it('handles missing properties in transformDto2Vo gracefully', () => {
    const botData = {
      bot_info: {},
    } as const;
    const result = useQueryCollectStore.getState().transformDto2Vo(botData);
    expect(result).toMatchObject({
      is_collected: undefined,
      private_policy: undefined,
    });
  });

  it('initializes store with provided data', () => {
    const botData = {
      bot_info: {
        user_query_collect_conf: {
          is_collected: false,
          private_policy: 'New policy',
        },
      },
    } as const;
    useQueryCollectStore.getState().initStore(botData);
    const state = useQueryCollectStore.getState();
    expect(state.is_collected).toBe(false);
    expect(state.private_policy).toBe('New policy');
  });

  it('clears the store to default state', () => {
    const { setQueryCollect } = useQueryCollectStore.getState();
    setQueryCollect({ is_collected: true, private_policy: 'Some policy' });
    useQueryCollectStore.getState().clear();
    const stateAfterClear = useQueryCollectStore.getState();
    expect(stateAfterClear.is_collected).toBe(false);
    expect(stateAfterClear.private_policy).toBe('');
  });
});
