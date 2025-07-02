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
