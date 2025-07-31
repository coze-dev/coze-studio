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

import { ToolGroupKey, ToolKey } from '@coze-agent-ide/tool-config';

import {
  createToolAreaStore,
  type ToolAreaStore,
} from '../../src/store/tool-area';

let useToolAreaStore: ToolAreaStore;

vi.stubGlobal('IS_DEV_MODE', false);

beforeEach(() => {
  const newToolAreaStore = createToolAreaStore();
  useToolAreaStore = newToolAreaStore;
});

const testToolKeyConfig = {
  toolGroupKey: ToolGroupKey.DIALOG,
  toolKey: ToolKey.PLUGIN,
  toolTitle: '工具1',
  hasValidData: false,
};

const repeatTestToolKeyConfig = {
  toolGroupKey: ToolGroupKey.CHARACTER,
  toolKey: ToolKey.PLUGIN,
  toolTitle: 'Repeat 工具1',
  hasValidData: false,
};

const testToolGroup = {
  toolGroupKey: ToolGroupKey.DIALOG,
  groupTitle: '测试分组',
};

describe('useToolAreaStore', () => {
  test('appendIntoRegisteredToolKeyConfigList add one', () => {
    const { appendIntoRegisteredToolKeyConfigList } =
      useToolAreaStore.getState();

    appendIntoRegisteredToolKeyConfigList(testToolKeyConfig);

    expect(
      useToolAreaStore.getState().registeredToolKeyConfigList,
    ).toStrictEqual([testToolKeyConfig]);
  });

  test('appendIntoRegisteredToolKeyConfigList repeat filter', () => {
    const { appendIntoRegisteredToolKeyConfigList } =
      useToolAreaStore.getState();

    appendIntoRegisteredToolKeyConfigList(testToolKeyConfig);
    appendIntoRegisteredToolKeyConfigList(repeatTestToolKeyConfig);

    expect(
      useToolAreaStore.getState().registeredToolKeyConfigList,
    ).toStrictEqual([testToolKeyConfig]);
  });

  test('hasToolKeyInRegisteredToolKeyList', () => {
    const { appendIntoRegisteredToolKeyConfigList } =
      useToolAreaStore.getState();

    appendIntoRegisteredToolKeyConfigList(testToolKeyConfig);

    expect(
      useToolAreaStore
        .getState()
        .hasToolKeyInRegisteredToolKeyList(testToolKeyConfig.toolKey),
    ).toBe(true);

    expect(
      useToolAreaStore
        .getState()
        .hasToolKeyInRegisteredToolKeyList(ToolKey.DATABASE),
    ).toBe(false);
  });

  test('appendIntoInitialedToolKeyList', () => {
    const { appendIntoInitialedToolKeyList } = useToolAreaStore.getState();

    appendIntoInitialedToolKeyList(ToolKey.PLUGIN);

    expect(useToolAreaStore.getState().initialedToolKeyList).toStrictEqual([
      ToolKey.PLUGIN,
    ]);
  });

  test('hasToolKeyInInitialedToolKeyList', () => {
    const { appendIntoInitialedToolKeyList } = useToolAreaStore.getState();

    appendIntoInitialedToolKeyList(ToolKey.PLUGIN);

    expect(
      useToolAreaStore
        .getState()
        .hasToolKeyInInitialedToolKeyList(ToolKey.PLUGIN),
    ).toBe(true);

    expect(
      useToolAreaStore
        .getState()
        .hasToolKeyInInitialedToolKeyList(ToolKey.ONBOARDING),
    ).toBe(false);
  });

  test('setToolHasValidData', () => {
    const { appendIntoRegisteredToolKeyConfigList, setToolHasValidData } =
      useToolAreaStore.getState();

    appendIntoRegisteredToolKeyConfigList(testToolKeyConfig);

    setToolHasValidData({
      toolKey: testToolKeyConfig.toolKey,
      hasValidData: true,
    });

    expect(
      useToolAreaStore.getState().registeredToolKeyConfigList,
    ).toStrictEqual([
      {
        ...testToolKeyConfig,
        hasValidData: true,
      },
    ]);
  });

  test('appendIntoRegisteredToolGroupList', () => {
    const { appendIntoRegisteredToolGroupList } = useToolAreaStore.getState();

    appendIntoRegisteredToolGroupList(testToolGroup);

    expect(useToolAreaStore.getState().registeredToolGroupList).toStrictEqual([
      testToolGroup,
    ]);
  });
});
