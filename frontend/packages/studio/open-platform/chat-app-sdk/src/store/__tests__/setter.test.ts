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

import { describe, test, expect, vi } from 'vitest';
import { AuthType } from '@coze-studio/open-chat/types';

import { createGlobalStore } from '@/store/global';
import { WebChatClient } from '@/client';
import type * as ClientModule from '@/client';

vi.hoisted(() => {
  // @ts-expect-error -- 将 IS_OVERSEA 提升到最外层
  global.IS_OVERSEA = false;
});

vi.mock('./auth', () => ({
  AuthClient: vi.fn().mockImplementation(() => ({
    initToken: vi.fn().mockResolvedValue(false),
    checkOptions: vi.fn().mockReturnValue(true),
  })),
}));

vi.mock('@/components/widget', () => ({
  default: vi.fn(),
}));

vi.mock('@coze-studio/open-chat', () => ({
  postErrorMessage: vi.fn(),
  ChatSdkErrorType: {
    OPEN_API_ERROR: 'OPEN_API_ERROR',
  },
}));

describe('createGlobalStore setter', () => {
  console.log('[dev]...', WebChatClient);
  test('simple states', async () => {
    const store = createGlobalStore(
      new WebChatClient({
        config: {
          botId: '',
        },
      }),
    );

    const { setIframe, setChatVisible, setIframeLoaded, setImagePreview } =
      store.getState();
    const iframe = document.createElement('iframe');

    setIframe(iframe);
    await setChatVisible(true);
    setIframeLoaded(false);
    setImagePreview(preview => {
      preview.url = 'xxx';
      preview.visible = true;
    });
    store.getState().setThemeType('bg-theme');
    expect(store.getState().themeType).toBe('bg-theme');

    expect(store.getState()).toEqual(
      expect.objectContaining({
        iframe,
        chatVisible: true,
        iframeLoaded: false,
      }),
    );

    expect(store.getState().imagePreview).toMatchObject({
      url: 'xxx',
      visible: true,
    });
  });

  test('token invalid', async () => {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const { WebChatClient: Client } =
      await vi.importActual<typeof ClientModule>('@/client');

    const store = createGlobalStore(
      new Client({
        config: {
          botId: '',
        },
        auth: {
          type: AuthType.TOKEN,
          token: '',
          onRefreshToken: () => '',
        },
      }),
    );
    const { setChatVisible } = store.getState();
    await setChatVisible(true);
    expect(store.getState().chatVisible).toBe(false);
  });
});
