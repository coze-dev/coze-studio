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

import { useManuallySwitchAgentStore } from '../../src/store/manually-switch-agent-store';
import { useBotDetailStoreSet } from '../../src/store/index';

describe('useManuallySwitchAgentStore', () => {
  beforeEach(() => {
    useBotDetailStoreSet.clear();
  });

  it('initializes with null agentId', () => {
    const state = useManuallySwitchAgentStore.getState();
    expect(state.agentId).toBe(null);
  });

  it('records agentId on manual switch', () => {
    const recordAgentId =
      useManuallySwitchAgentStore.getState().recordAgentIdOnManuallySwitchAgent;
    recordAgentId('agent-123');
    expect(useManuallySwitchAgentStore.getState().agentId).toBe('agent-123');
  });

  it('clears agentId successfully', () => {
    const recordAgentId =
      useManuallySwitchAgentStore.getState().recordAgentIdOnManuallySwitchAgent;
    const { clearAgentId } = useManuallySwitchAgentStore.getState();
    recordAgentId('agent-123');
    clearAgentId();
    expect(useManuallySwitchAgentStore.getState().agentId).toBe(null);
  });

  it('handles multiple calls to recordAgentId', () => {
    const recordAgentId =
      useManuallySwitchAgentStore.getState().recordAgentIdOnManuallySwitchAgent;
    recordAgentId('agent-456');
    recordAgentId('agent-789');
    expect(useManuallySwitchAgentStore.getState().agentId).toBe('agent-789');
  });

  it('retains agentId until explicitly cleared', () => {
    const recordAgentId =
      useManuallySwitchAgentStore.getState().recordAgentIdOnManuallySwitchAgent;
    recordAgentId('agent-999');
    const stateAfterRecord = useManuallySwitchAgentStore.getState().agentId;
    expect(stateAfterRecord).toBe('agent-999');

    useBotDetailStoreSet.clear();
    const stateAfterClear = useManuallySwitchAgentStore.getState().agentId;
    expect(stateAfterClear).toBe(null);
  });
});
