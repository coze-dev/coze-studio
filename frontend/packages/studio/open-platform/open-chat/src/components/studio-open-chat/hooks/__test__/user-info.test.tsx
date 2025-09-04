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
import { renderHook } from '@testing-library/react';

import { type StudioChatProviderProps } from '@/types/props';
import { OpenApiSource } from '@/types/open';

import { useUserInfo } from '../use-user-info';
import { ChatPropsProvider } from '../../store/context';

vi.hoisted(() => {
  // @ts-expect-error -- 将 IS_OVERSEA 提升到最外层
  global.IS_OVERSEA = false;
});

vi.mock('@/components/conversation-list-sider', () => ({
  // eslint-disable-next-line @typescript-eslint/naming-convention
  ConversationListSider: () => <div></div>,
}));

describe('user-info', () => {
  const testProps: StudioChatProviderProps = {
    chatConfig: {
      bot_id: 'test',
      source: OpenApiSource.WebSdk,
      conversation_id: 'test',
    },
    userInfo: {
      id: 'test-id',
      nickname: 'test-nickname',
      url: 'test-url',
    },
  };

  test('test props first', () => {
    const { result: userInfo } = renderHook(useUserInfo, {
      wrapper: props => (
        <ChatPropsProvider appProps={testProps}>
          {props.children}
        </ChatPropsProvider>
      ),
    });

    expect(userInfo.current?.nickname).toBe('test-nickname');
  });
});
