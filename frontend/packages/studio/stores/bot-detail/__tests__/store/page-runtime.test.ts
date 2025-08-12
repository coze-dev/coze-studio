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

import { type TabDisplayItems, TabStatus } from '@coze-arch/idl/developer_api';
import { SpaceApi } from '@coze-arch/bot-space-api';

import { getDefaultPageRuntimeStore } from '../../src/store/page-runtime/store';
import { DEFAULT_BOT_SKILL_BLOCK_COLLAPSIBLE_STATE } from '../../src/store/page-runtime/defaults';
import {
  type PageRuntime,
  usePageRuntimeStore,
} from '../../src/store/page-runtime';
import { useBotDetailStoreSet } from '../../src/store/index';
import { useBotInfoStore } from '../../src/store/bot-info';

describe('usePageRuntimeStore', () => {
  beforeEach(() => {
    useBotDetailStoreSet.clear();
  });

  it('updates page runtime state using setPageRuntimeByImmer correctly', () => {
    const update = (state: PageRuntime) => {
      state.editable = true;
      state.isSelf = true;
    };
    usePageRuntimeStore.getState().setPageRuntimeByImmer(update);
    const updatedState = usePageRuntimeStore.getState();
    expect(updatedState.editable).toBe(true);
    expect(updatedState.isSelf).toBe(true);
  });

  it('setBotSkillBlockCollapsibleState', () => {
    useBotInfoStore.getState().setBotInfoByImmer(state => {
      state.space_id = '1234';
    });

    const displayInfo: TabDisplayItems = {
      plugin_tab_status: TabStatus.Close,
    };
    const emptyDisplayInfo = {};

    usePageRuntimeStore
      .getState()
      .setBotSkillBlockCollapsibleState(displayInfo);
    expect(
      usePageRuntimeStore.getState().botSkillBlockCollapsibleState,
    ).toMatchObject(displayInfo);

    usePageRuntimeStore
      .getState()
      .setBotSkillBlockCollapsibleState(emptyDisplayInfo);
    expect(
      usePageRuntimeStore.getState().botSkillBlockCollapsibleState,
    ).toMatchObject(displayInfo);
  });

  it('setBotSkillBlockCollapsibleState', () => {
    useBotInfoStore.getState().setBotInfoByImmer(state => {
      state.space_id = '1234';
    });

    const displayInfo: TabDisplayItems = {
      plugin_tab_status: TabStatus.Close,
    };
    const emptyDisplayInfo = {};

    usePageRuntimeStore
      .getState()
      .setBotSkillBlockCollapsibleState(displayInfo, true);
    expect(
      usePageRuntimeStore.getState().botSkillBlockCollapsibleState,
    ).toMatchObject(displayInfo);

    usePageRuntimeStore
      .getState()
      .setBotSkillBlockCollapsibleState(emptyDisplayInfo, true);
    expect(
      usePageRuntimeStore.getState().botSkillBlockCollapsibleState,
    ).toMatchObject(displayInfo);
  });

  it('setBotSkillBlockCollapsibleState', () => {
    const status = {
      plugin_tab_status: TabStatus.Default,
      workflow_tab_status: TabStatus.Open,
      knowledge_tab_status: TabStatus.Close,
    };

    const overall = {
      botSkillBlockCollapsibleState: {
        plugin_tab_status: TabStatus.Default,
        workflow_tab_status: TabStatus.Default,
        knowledge_tab_status: TabStatus.Default,
      },
    };

    usePageRuntimeStore.getState().setPageRuntimeBotInfo(overall);

    usePageRuntimeStore.getState().setBotSkillBlockCollapsibleState(status);

    expect(
      usePageRuntimeStore.getState().botSkillBlockCollapsibleState,
    ).toMatchObject(status);
  });

  it('getBotSkillBlockCollapsibleState', async () => {
    const defaultStatus = DEFAULT_BOT_SKILL_BLOCK_COLLAPSIBLE_STATE();

    try {
      await usePageRuntimeStore.getState().getBotSkillBlockCollapsibleState();
    } catch (error) {
      expect(error).toEqual('error');
    }
    expect(
      usePageRuntimeStore.getState().botSkillBlockCollapsibleState,
    ).toMatchObject(defaultStatus);
    usePageRuntimeStore.getState().clear();

    await usePageRuntimeStore.getState().getBotSkillBlockCollapsibleState();
    expect(
      usePageRuntimeStore.getState().botSkillBlockCollapsibleState,
    ).toMatchObject(defaultStatus);
    usePageRuntimeStore.getState().clear();

    await usePageRuntimeStore.getState().getBotSkillBlockCollapsibleState();
    expect(
      usePageRuntimeStore.getState().botSkillBlockCollapsibleState,
    ).toMatchObject(defaultStatus);
    usePageRuntimeStore.getState().clear();

    await usePageRuntimeStore.getState().getBotSkillBlockCollapsibleState();
    expect(
      usePageRuntimeStore.getState().botSkillBlockCollapsibleState,
    ).toMatchObject({
      plugin_tab_status: TabStatus.Close,
      workflow_tab_status: TabStatus.Open,
      knowledge_tab_status: TabStatus.Default,
    });
  });

  it('initializes store with provided data using initStore', () => {
    const dummyData = { editable: true, has_unpublished_change: true };
    usePageRuntimeStore.getState().initStore(dummyData);
    expect(usePageRuntimeStore.getState().editable).toBe(true);
    expect(usePageRuntimeStore.getState().hasUnpublishChange).toBe(true);
  });

  it('clears to default state successfully', () => {
    const displayInfo = {
      plugin_tab_status: TabStatus.Open,
    };
    usePageRuntimeStore
      .getState()
      .setBotSkillBlockCollapsibleState(displayInfo);
    usePageRuntimeStore.getState().clear();
    const stateAfterClear = usePageRuntimeStore.getState();
    expect(stateAfterClear.init).toBe(false);
    expect(stateAfterClear.botSkillBlockCollapsibleState).toEqual(
      getDefaultPageRuntimeStore().botSkillBlockCollapsibleState,
    );
  });

  it('handles errors in getBotSkillBlockCollapsibleState gracefully', async () => {
    const mockGetDraftBotDisplayInfo = vi
      .spyOn(SpaceApi, 'GetDraftBotDisplayInfo')
      .mockRejectedValue('error');
    await expect(
      usePageRuntimeStore.getState().getBotSkillBlockCollapsibleState(),
    ).rejects.toEqual('error');
    expect(
      usePageRuntimeStore.getState().botSkillBlockCollapsibleState,
    ).toMatchObject(DEFAULT_BOT_SKILL_BLOCK_COLLAPSIBLE_STATE());
    mockGetDraftBotDisplayInfo.mockRestore();
  });

  it('sets isPreview correctly based on version', () => {
    expect(usePageRuntimeStore.getState().getIsPreview()).toBe(false);
    expect(usePageRuntimeStore.getState().getIsPreview('version1')).toBe(true);
  });
});
