import {
  getDefaultPersonaStore,
  usePersonaStore,
} from '../../src/store/persona';
import { useBotDetailStoreSet } from '../../src/store/index';
import {
  getDefaultBotInfoStore,
  useBotInfoStore,
} from '../../src/store/bot-info';

describe('useBotDetailStoreSet', () => {
  beforeEach(() => {
    useBotDetailStoreSet.clear();
  });
  it('clearStore', () => {
    const overall = {
      botId: 'fake bot ID',
    };
    const persona = {
      promptOptimizeStatus: 'endResponse',
    } as const;

    useBotInfoStore.getState().setBotInfo(overall);
    usePersonaStore.getState().setPersona(persona);

    useBotDetailStoreSet.clear();

    expect(useBotInfoStore.getState()).toMatchObject(getDefaultBotInfoStore());
    expect(usePersonaStore.getState()).toMatchObject(getDefaultPersonaStore());

    useBotInfoStore.getState().setBotInfo(overall);
    usePersonaStore.getState().setPersona(persona);
  });

  it('returns an object with all store hooks', () => {
    const storeSet = useBotDetailStoreSet.getStore();
    expect(storeSet).toHaveProperty('usePersonaStore');
    expect(storeSet).toHaveProperty('useQueryCollectStore');
    expect(storeSet).toHaveProperty('useMultiAgentStore');
    expect(storeSet).toHaveProperty('useModelStore');
    expect(storeSet).toHaveProperty('useBotSkillStore');
    expect(storeSet).toHaveProperty('useBotInfoStore');
    expect(storeSet).toHaveProperty('useCollaborationStore');
    expect(storeSet).toHaveProperty('usePageRuntimeStore');
    expect(storeSet).toHaveProperty('useMonetizeConfigStore');
    expect(storeSet).toHaveProperty('useManuallySwitchAgentStore');
  });

  it('clears all stores successfully', () => {
    const storeSet = useBotDetailStoreSet.getStore();
    const clearSpy = vi.spyOn(storeSet.usePersonaStore.getState(), 'clear');

    useBotDetailStoreSet.clear();

    expect(clearSpy).toHaveBeenCalled();
  });

  it('clears agent ID from manually switch agent store', () => {
    const storeSet = useBotDetailStoreSet.getStore();
    const clearAgentIdSpy = vi.spyOn(
      storeSet.useManuallySwitchAgentStore.getState(),
      'clearAgentId',
    );

    useBotDetailStoreSet.clear();

    expect(clearAgentIdSpy).toHaveBeenCalled();
  });
});
