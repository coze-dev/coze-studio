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

import { BotMarketStatus, BotMode } from '@coze-arch/idl/developer_api';

import { useBotDetailStoreSet } from '../../src/store/index';
import {
  getDefaultBotInfoStore,
  useBotInfoStore,
} from '../../src/store/bot-info';
const DEFAULT_BOT_DETAIL = getDefaultBotInfoStore();

describe('useBotInfoStore', () => {
  beforeEach(() => {
    useBotDetailStoreSet.clear();
  });
  it('initStore', () => {
    const botData = {
      bot_info: {
        bot_id: '123',
        bot_mode: BotMode.MultiMode,
        name: 'Test Bot',
        description: 'This is a test bot',
        icon_uri: 'http://example.com/icon.png',
        icon_url: 'http://example.com/icon_url.png',
        create_time: '2022-01-01T00:00:00Z',
        creator_id: 'creator_1',
        update_time: '2022-01-02T00:00:00Z',
        connector_id: 'connector_1',
        version: '1.0.0',
      },
      bot_market_status: BotMarketStatus.Online,
      publisher: {},
      has_publish: true,
      connectors: [],
      publish_time: '2022-01-01T00:00:00Z',
      space_id: 'space_1',
    };

    useBotInfoStore.getState().initStore(botData);

    expect(useBotInfoStore.getState()).toMatchObject({
      botId: '123',
      connectors: [],
      publish_time: '2022-01-01T00:00:00Z',
      space_id: 'space_1',
      has_publish: true,
      mode: BotMode.MultiMode,
      publisher: {},
      botMarketStatus: BotMarketStatus.Online,
      name: 'Test Bot',
      description: 'This is a test bot',
      icon_uri: 'http://example.com/icon.png',
      icon_url: 'http://example.com/icon_url.png',
      create_time: '2022-01-01T00:00:00Z',
      creator_id: 'creator_1',
      update_time: '2022-01-02T00:00:00Z',
      version: '1.0.0',
      raw: {
        bot_id: '123',
        bot_mode: BotMode.MultiMode,
        name: 'Test Bot',
        description: 'This is a test bot',
        icon_uri: 'http://example.com/icon.png',
        icon_url: 'http://example.com/icon_url.png',
        create_time: '2022-01-01T00:00:00Z',
        creator_id: 'creator_1',
        update_time: '2022-01-02T00:00:00Z',
        connector_id: 'connector_1',
        version: '1.0.0',
      },
    });
  });

  it('setBotInfo', () => {
    const botInfoToMerge = {
      botId: '123',
      connectors: [],
      publish_time: '2022-01-01T00:00:00Z',
      space_id: 'space_1',
      has_publish: true,
      mode: BotMode.MultiMode,
      publisher: {},
      botMarketStatus: BotMarketStatus.Online,
      name: 'Test Bot',
      description: 'This is a test bot',
      icon_uri: 'http://example.com/icon.png',
      icon_url: 'http://example.com/icon_url.png',
      create_time: '2022-01-01T00:00:00Z',
      creator_id: 'creator_1',
      connector_id: '',
      update_time: '2022-01-02T00:00:00Z',
      version: '1.0.0',
      raw: {
        bot_id: '123',
        bot_mode: BotMode.MultiMode,
        name: 'Test Bot',
        description: 'This is a test bot',
        icon_uri: 'http://example.com/icon.png',
        icon_url: 'http://example.com/icon_url.png',
        create_time: '2022-01-01T00:00:00Z',
        creator_id: 'creator_1',
        update_time: '2022-01-02T00:00:00Z',
        connector_id: 'connector_1',
        version: '1.0.0',
      },
    };

    useBotInfoStore.getState().setBotInfo(botInfoToMerge);

    expect(useBotInfoStore.getState()).toMatchObject(botInfoToMerge);

    const overallToReplace = Object.assign(
      {},
      DEFAULT_BOT_DETAIL,
      botInfoToMerge,
    );

    useBotInfoStore.getState().setBotInfo(botInfoToMerge, { replace: true });

    expect(useBotInfoStore.getState()).toMatchObject(overallToReplace);
  });

  it('setBotInfoByImmer', () => {
    const overall = {
      botId: 'fake bot ID',
    };

    useBotInfoStore.getState().setBotInfoByImmer(state => {
      state.botId = overall.botId;
    });

    expect(useBotInfoStore.getState()).toMatchObject(overall);
  });

  it('should merge existing state when setting bot info', () => {
    const initialBotInfo = {
      botId: '789',
      name: 'Existing Bot',
      connectors: ['connector_1'],
    };
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    useBotInfoStore.getState().initStore(initialBotInfo);

    const newBotInfo = {
      botId: '789',
      description: 'Updated description',
    };
    useBotInfoStore.getState().setBotInfo(newBotInfo);

    expect(useBotInfoStore.getState().description).toBe('Updated description');
    expect(useBotInfoStore.getState().connectors).toEqual(['connector_1']);
  });

  it('should correctly update the state using setBotInfoByImmer', () => {
    useBotInfoStore.getState().setBotInfoByImmer(state => {
      state.publish_time = '2022-01-01T10:00:00Z';
    });
    expect(useBotInfoStore.getState().publish_time).toBe(
      '2022-01-01T10:00:00Z',
    );
  });
});
