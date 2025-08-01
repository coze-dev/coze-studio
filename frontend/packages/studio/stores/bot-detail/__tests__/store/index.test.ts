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
