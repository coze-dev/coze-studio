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

/* eslint-disable -- test */
vi.mock(
  '../../chat-area-utils/src/parse-markdown/parse-markdown-to-text.ts',
  () => ({
    parseMarkdown: vi.fn(),
  }),
);

import Mock from 'mockjs';
import { ContentType, Scene, type Message } from '@coze-common/chat-core';
import { describe, expect, it, vi } from 'vitest';
import { type MessagesStore, createMessagesStore } from '../src/store/messages';

import {
  type MessageGroup,
  type TextMessage,
  type MessageIdStruct,
} from '../src/store/types';
import { createSectionIdStore } from '../src/store/section-id';
import { subscribeMessageToUpdateMessageGroup } from '../src/store/messages';
import { SystemLifeCycleService } from '../src/plugin/life-cycle';
import { renderHook } from '@testing-library/react-hooks';
import { useCreatePluginStoreSet } from '../src/hooks/context/use-create-plugin-store';
import { createPluginStore } from '../src/store/plugins';

vi.mock('@coze-common/chat-core', () => ({
  ContentType: vi.fn(),
  VerboseMsgType: vi.fn(),
  Scene: {
    CozeHome: 3,
  },
  messageSource: vi.fn(),
}));

vi.mock('@coze-arch/coze-design', () => ({
  UIToast: {
    error: vi.fn(),
  },
}));

vi.mock('@coze-arch/bot-api/memory', () => ({
  BotTableRWMode: {
    LimitedReadWrite: 1,
    ReadOnly: 2,
    CozeHome: 3,
  },
  messageSource: vi.fn(),
}));

vi.mock('../src/utils/message', () => ({
  getMessageUniqueKey: vi.fn(
    (message: Message<ContentType>) =>
      message?.message_id || message?.extra_info?.local_message_id,
  ),
  findMessageById: vi.fn((messages: Message<ContentType>[], id: string) =>
    messages.find(
      m => m.message_id === id || m.extra_info?.local_message_id === id,
    ),
  ),
  findMessageByIdStruct: vi.fn(
    (messages: Message<ContentType>[], idStruct: MessageIdStruct) =>
      messages.find(
        m =>
          m.message_id === idStruct.message_id ||
          m.extra_info?.local_message_id ===
            idStruct.extra_info?.local_message_id,
      ),
  ),
  findMessageIndexById: vi.fn((messages: Message<ContentType>[], id: string) =>
    messages.findIndex(
      m => m.message_id === id || m.extra_info?.local_message_id === id,
    ),
  ),
  findMessageIndexByIdStruct: vi.fn(
    (messages: Message<ContentType>[], idStruct: MessageIdStruct) =>
      messages.findIndex(
        m =>
          m.message_id === idStruct.message_id ||
          m.extra_info?.local_message_id ===
            idStruct.extra_info?.local_message_id,
      ),
  ),
  getIsValidMessage: vi.fn(() => true),
  getIsTriggerMessage: vi.fn(() => false),
}));

vi.stubGlobal('IS_DEV_MODE', false);
let useMessagesStore: MessagesStore;

const testMessageId = '321321';
const testMessageLocalId = '123123';
const testUserMessageLocalId = '6345634523';

const testReplyId = '666666666';
const testSectionId = '9999';

const testMessage: Message<ContentType.Text> = {
  message_id: testMessageId,
  extra_info: {
    local_message_id: testMessageLocalId,
    bot_state: '',
    execute_display_name: '',
    input_tokens: '',
    output_tokens: '',
    plugin: '',
    plugin_request: '',
    plugin_status: '',
    time_cost: '',
    token: '',
    tool_name: '',
    workflow_tokens: '',
  },
  role: 'assistant',
  content: '',
  content_obj: '',
  type: 'answer',
  is_finish: true,
  broken_pos: 9999999,
  reply_id: testReplyId,
  section_id: '',
  sender_id: '',
  mention_list: [],
  content_type: ContentType.Text,
};

const testUserMessage: TextMessage = {
  role: 'user',
  type: 'ack',
  content: '',
  content_type: ContentType.Text,
  message_id: testReplyId,
  reply_id: testReplyId,
  section_id: '',
  extra_info: {
    local_message_id: testUserMessageLocalId,
    input_tokens: '',
    output_tokens: '',
    token: '',
    plugin_status: '',
    time_cost: '',
    workflow_tokens: '',
    bot_state: '',
    plugin_request: '',
    tool_name: '',
    plugin: '',
    execute_display_name: '',
  },
  /** Normal, interrupted state, used when pulling the message list, this field is not available when chat is running. */
  /** interrupt position */
  broken_pos: 9999999,
  sender_id: '',
  mention_list: [],
  content_obj: '',
  is_finish: true,
};

Mock.Random.extend({
  random_type() {
    const type = [
      'answer',
      'function_call',
      'tool_response',
      'follow_up',
      'ack',
      'question',
    ];
    return this.pick?.(type);
  },
  random_content_type() {
    const contentType = [
      'text',
      'link',
      'music',
      'video',
      'card',
      'image',
      'file',
      'tako',
      'custom',
    ];
    return this.pick?.(contentType);
  },
  random_message_status() {
    const status = ['available', 'broken'];
    return this.pick?.(status);
  },
});

const randomTestMessageList: Message<ContentType>[] = Mock.mock({
  'array|20-60': [
    {
      role: 'assistant',
      type: '@RANDOM_TYPE',
      content: '@string',
      content_type: '@RANDOM_CONTENT_TYPE',
      message_id: '@string',
      reply_id: '9999999',
      section_id: '8888888',
      extra_info: {
        local_message_id: '@string',
        input_tokens: '@string',
        output_tokens: '@string',
        token: '@string',
        plugin_status: '@string',
        time_cost: '@string',
        workflow_tokens: '@string',
        bot_state: '@string',
        plugin_request: '@string',
        tool_name: '@string',
        plugin: '@string',
      },
      /** Normal, interrupted state, used when pulling the message list, this field is not available when chat is running. */
      /** interrupt position */
      broken_pos: 9999999,
      sender_id: '77777',
      mention_list: [],
      content_obj: '',
      is_finish: true,
    },
  ],
}).array;

beforeEach(() => {
  vi.useFakeTimers();

  const sectionIdStore = createSectionIdStore('unit-test');
  const newUseMessagesStore = createMessagesStore('unit-test');
  const { result } = renderHook(() =>
    useCreatePluginStoreSet({
      mark: 'test',
      scene: Scene.CozeHome,
    }),
  );
  const pluginStore = createPluginStore('unit-test');

  const lifeCycleService = new SystemLifeCycleService({
    usePluginStore: pluginStore,
  });

  useMessagesStore = newUseMessagesStore;
  sectionIdStore.getState().setLatestSectionId(testSectionId);
  subscribeMessageToUpdateMessageGroup(
    {
      useMessagesStore: newUseMessagesStore,
      useSectionIdStore: sectionIdStore,
    },
    {},
    lifeCycleService,
  );
});

describe('useMessagesStore', () => {
  beforeEach(() => {
    useMessagesStore = createMessagesStore('unit-test');
  });

  it('findMessage', () => {
    const { findMessage } = useMessagesStore.getState();
    const undefinedResult = findMessage('not-exist');
    expect(undefinedResult).toBeUndefined();

    useMessagesStore.getState().addMessage(testMessage);

    const messageByLocalId = findMessage(testMessageLocalId);
    expect(messageByLocalId).toStrictEqual(testMessage);
    const messageById = findMessage(testMessageId);
    expect(messageById).toStrictEqual(testMessage);
  });

  it('hasMessage', () => {
    const { hasMessage } = useMessagesStore.getState();
    const falsy = hasMessage('not-exist');
    expect(falsy).toBeFalsy();

    useMessagesStore.getState().addMessage(testMessage);

    const localIdTruthy = hasMessage(testMessageLocalId);
    expect(localIdTruthy).toBeTruthy();
    const idTruthy = hasMessage(testMessageId);
    expect(idTruthy).toBeTruthy();
  });

  it('updateMessage', () => {
    const { updateMessage } = useMessagesStore.getState();
    useMessagesStore.getState().addMessage(testMessage);

    const newMessage: Message<ContentType.Text> = {
      ...testMessage,
      content: 'new content',
    };
    updateMessage(testMessageId, newMessage);

    const message = useMessagesStore.getState().findMessage(testMessageId);
    expect(message?.content).toBe('new content');
  });

  it('addMessage', () => {
    const { addMessage } = useMessagesStore.getState();
    addMessage(testMessage);

    const message = useMessagesStore.getState().findMessage(testMessageId);
    expect(message).toStrictEqual(testMessage);
  });

  it('addMessages', () => {
    const { addMessages } = useMessagesStore.getState();
    addMessages([testMessage]);

    const message = useMessagesStore.getState().findMessage(testMessageId);
    expect(message).toStrictEqual(testMessage);
  });

  it('deleteMessageByIdStruct', () => {
    const { deleteMessageByIdStruct } = useMessagesStore.getState();
    useMessagesStore.getState().addMessage(testMessage);

    const errorIdStruct: MessageIdStruct = {
      message_id: 'not-exist',
      extra_info: { local_message_id: 'not-exist' },
    };

    const correctIdStruct: MessageIdStruct = {
      message_id: testMessageId,
      extra_info: { local_message_id: testMessageLocalId },
    };

    deleteMessageByIdStruct(errorIdStruct);

    expect(useMessagesStore.getState().messages).toStrictEqual([testMessage]);

    deleteMessageByIdStruct(correctIdStruct);

    expect(useMessagesStore.getState().messages).toStrictEqual([]);
  });

  it('deleteMessageById', () => {
    const { deleteMessageById } = useMessagesStore.getState();
    useMessagesStore.getState().addMessage(testMessage);

    const errorId = 'not-exist';

    deleteMessageById(errorId);

    expect(useMessagesStore.getState().messages).toStrictEqual([testMessage]);

    deleteMessageById(testMessageId);

    expect(useMessagesStore.getState().messages).toStrictEqual([]);
  });

  it('deleteMessageByIdList', () => {
    const { deleteMessageByIdList } = useMessagesStore.getState();
    useMessagesStore.getState().addMessage(testMessage);

    const errorIdList = ['not-exist'];

    deleteMessageByIdList(errorIdList);

    expect(useMessagesStore.getState().messages).toStrictEqual([testMessage]);

    deleteMessageByIdList([testMessageId]);

    expect(useMessagesStore.getState().messages).toStrictEqual([]);
  });

  it('setGroupMessageList', () => {
    const { setGroupMessageList } = useMessagesStore.getState();
    useMessagesStore.getState().addMessage(testMessage);

    const messageGroup = {
      groupId: testReplyId,
      memberSet: {
        userMessageId: '',
        llmAnswerMessageIdList: [testMessageId],
        functionCallMessageIdList: [],
        followUpMessageIdList: [],
      },
      sectionId: '',
      showContextDivider: 'with-onboarding' as const,
      showSuggestions: false,
      isLatest: true,
    };

    setGroupMessageList([messageGroup]);

    expect(useMessagesStore.getState().messageGroupList).toStrictEqual([
      messageGroup,
    ]);
  });

  it('getMessageGroupById', () => {
    const { getMessageGroupById } = useMessagesStore.getState();
    useMessagesStore.getState().addMessage(testMessage);

    const messageGroup = {
      groupId: testReplyId,
      memberSet: {
        userMessageId: '',
        llmAnswerMessageIdList: [testMessageId],
        functionCallMessageIdList: [],
        followUpMessageIdList: [],
      },
      sectionId: '',
      showContextDivider: 'with-onboarding' as const,
      showSuggestions: false,
      isLatest: true,
    };

    useMessagesStore.getState().setGroupMessageList([messageGroup]);

    expect(getMessageGroupById(testReplyId)).toStrictEqual(messageGroup);
  });

  it('getMessageGroupByUserMessageId', () => {
    const { getMessageGroupByUserMessageId } = useMessagesStore.getState();
    useMessagesStore.getState().addMessage(testMessage);

    const messageGroup = {
      groupId: testReplyId,
      memberSet: {
        userMessageId: testReplyId,
        llmAnswerMessageIdList: [testMessageId],
        functionCallMessageIdList: [],
        followUpMessageIdList: [],
      },
      sectionId: '',
      showContextDivider: 'with-onboarding' as const,
      showSuggestions: false,
      isLatest: true,
    };

    useMessagesStore.getState().setGroupMessageList([messageGroup]);

    expect(getMessageGroupByUserMessageId(testReplyId)).toStrictEqual(
      messageGroup,
    );
  });

  it('isLastMessageGroup', () => {
    const { isLastMessageGroup } = useMessagesStore.getState();
    useMessagesStore.getState().addMessage(testMessage);

    const messageGroup = {
      groupId: testReplyId,
      memberSet: {
        userMessageId: '',
        llmAnswerMessageIdList: [testMessageId],
        functionCallMessageIdList: [],
        followUpMessageIdList: [],
      },
      sectionId: '',
      showContextDivider: 'with-onboarding' as const,
      showSuggestions: false,
      isLatest: true,
    };

    useMessagesStore.getState().setGroupMessageList([messageGroup]);

    expect(isLastMessageGroup(testReplyId)).toBeTruthy();
  });

  it('clearMessage', () => {
    const { clearMessage } = useMessagesStore.getState();
    useMessagesStore.getState().addMessage(testMessage);

    clearMessage();

    expect(useMessagesStore.getState().messages).toStrictEqual([]);
  });
});
