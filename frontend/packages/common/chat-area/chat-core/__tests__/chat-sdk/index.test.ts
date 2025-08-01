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

import ChatSDK from '@/chat-sdk';

describe('ChatSDK', () => {
  let props;
  let chatSDK: ChatSDK;

  beforeEach(() => {
    props = {
      bot_id: 'bot-id',
      conversation_id: 'conversation-id',
      biz: 'test-biz',
      user: 'test-user',
      env: 'test-env',
      deployVersion: 'v1.0',
      logLevel: 'error',
      scene: 'test-scene',
    };
    chatSDK = ChatSDK.create(props);
  });

  afterEach(() => {
    chatSDK.destroy();
  });

  it('should create ChatSDK instance successfully', () => {
    expect(chatSDK).toBeDefined();
  });

  it('should create a new ChatSDK instance', () => {
    const sdk = ChatSDK.create(props);
    expect(sdk).toBeInstanceOf(ChatSDK);
  });

  it('should return an existing ChatSDK instance if one with the same unique key exists', () => {
    const sdk1 = ChatSDK.create(props);
    const sdk2 = ChatSDK.create(props);
    expect(sdk2).toBe(sdk1);
  });

  it('should emit an event and trigger the correct callback', () => {
    const sdk = ChatSDK.create(props);
    const callback = vi.fn();

    sdk.on(ChatSDK.EVENTS.MESSAGE_RECEIVED_AND_UPDATE, callback);
    sdk.emit(ChatSDK.EVENTS.MESSAGE_RECEIVED_AND_UPDATE, { message: 'Hello' });

    expect(callback).toBeCalledWith({ message: 'Hello' });
  });

  it('should destroy the ChatSDK instance and clear all events', () => {
    const sdk = ChatSDK.create({ ...props, bot_id: 'test1' });
    const spy = vi.spyOn(sdk, 'destroy');
    const callback = vi.fn();

    sdk.on(ChatSDK.EVENTS.MESSAGE_RECEIVED_AND_UPDATE, callback);
    sdk.destroy();

    sdk.emit(ChatSDK.EVENTS.MESSAGE_RECEIVED_AND_UPDATE, { message: 'Hello' });
    expect(spy).toBeCalled();
    expect(callback).not.toBeCalled();
  });

  it('should throw an error if an attempt is made to create a duplicate instance', () => {
    ChatSDK.create(props);
    const consoleErrorSpy = vi.spyOn(console, 'error');
    ChatSDK.create(props);

    expect(consoleErrorSpy).toBeCalledWith(
      'duplicate chat core instance error',
    );
    consoleErrorSpy.mockRestore();
  });

  it('should be able to create a text message', () => {
    expect(
      chatSDK.createTextMessage({
        payload: {
          text: 'payload',
        },
      }),
    ).toBeDefined();
  });
});
