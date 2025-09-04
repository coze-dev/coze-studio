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

import { expect, describe, test, vi } from 'vitest';
import { Layout } from '@coze-studio/open-chat/types';

import { type CozeChatOptions } from '@/types/client';

import { AuthClient } from '../auth';
import type * as ClientModule from '..';

vi.hoisted(() => {
  // @ts-expect-error -- 将 IS_OVERSEA 提升到最外层
  global.IS_OVERSEA = false;
});

vi.mock('@/components/widget', () => ({
  default: vi.fn(),
}));

const testBotId = '7313780910216806444';

const config = {
  config: {
    botId: testBotId,
  },
  auth: {
    type: 'token',
    onRefreshToken: () => Promise.resolve('test'),
    token: 'Test',
  },
  componentProps: {
    title: '历史学教授',
  },
};

const config2: CozeChatOptions = {
  config: {
    bot_id: testBotId,
  },
  auth: {
    // @ts-expect-error -- 测试兼容逻辑
    type: 'token',
    onRefreshToken: () => Promise.resolve('test'),
    token: 'Test',
  },
  componentProps: {
    title: '历史学教授',
  },
};
const config3: CozeChatOptions = {
  config: {
    bot_id: testBotId,
  },
  auth: {
    onRefreshToken: () => Promise.resolve('test'),
    token: 'Test',
  },
  componentProps: {
    title: '历史学教授',
  },
};

const config4: CozeChatOptions = {
  config: {
    bot_id: testBotId,
  },
  auth: {
    // @ts-expect-error -- 测试兼容逻辑
    type: 'token',
    onRefreshToken: () => Promise.resolve(''),
    token: '',
  },
  componentProps: {
    title: '历史学教授',
  },
};

describe('client', async () => {
  const { WebChatClient } = await vi.importActual<typeof ClientModule>('..');

  test('client list', () => {
    const client1 = new WebChatClient(config);
    const client2 = new WebChatClient({
      ...config,
      el: document.createElement('div'),
    });

    client1.destroy();

    expect(WebChatClient.clients.length).toBe(1);
    expect(!WebChatClient.clients.includes(client1)).toBe(true);

    client2.destroy();

    expect(WebChatClient.clients.length).toBe(0);
    expect(!WebChatClient.clients.includes(client2)).toBe(true);
  });

  test('client mount', () => {
    const client = new WebChatClient(config2);
    const client2 = new WebChatClient({
      ...config2,
      el: document.createElement('div'),
    });

    // @ts-expect-error -- ut
    expect(!!client.defaultRoot).toBe(true);

    // @ts-expect-error -- ut
    expect(!!client2.defaultRoot).toBe(false);
  });

  test('init layout mobile', () => {
    vi.mock('react-device-detect', () => ({ isMobileOnly: true }));
    const client = new WebChatClient(config2);

    expect(client.options?.ui?.base?.layout).toBe(Layout.MOBILE);
  });

  test('init aut', async () => {
    const auth2 = new AuthClient(config2);

    expect(await auth2.initToken()).toBe(true);
    expect(auth2.checkOptions()).toBe(true);

    const auth3 = new AuthClient(config3);
    expect(await auth3.initToken()).toBe(true);
    expect(auth3.checkOptions()).toBe(false);

    const auth4 = new AuthClient(config4);
    expect(await auth4.initToken()).toBe(false);
    expect(auth4.checkOptions()).toBe(true);
  });
});
