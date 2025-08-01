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

import Mock from 'mockjs';

import { ChatCoreUploadPlugin } from '@/plugins/upload-plugin';
import {
  ContentType,
  type NormalizedMessageProps,
  type TextAndFileMixMessageProps,
  type TextMessageProps,
} from '@/message/types';
import { type CreateProps } from '@/chat-sdk/types/interface';
import ChatSDK from '@/chat-sdk';

const random = Mock.Random;

describe('创建消息', () => {
  // Create a ChatSDK instance
  const sdkProps: CreateProps = {
    bot_id: random.string(),
    biz: 'third_part',
    env: 'local',
    deployVersion: 'release',
    conversation_id: random.string(),
    user: 'user123',
    enableDebug: true,
  };
  const chat = new ChatSDK(sdkProps);

  // Register plugin
  // @ts-expect-error -- no real plugin is required in the test file
  chat.registerPlugin('upload-plugin', ChatCoreUploadPlugin, {
    userId: '123',
    appId: 123,
  });

  it('createTextMessage', () => {
    // Standard Output Message
    const messageStand = {
      bot_id: sdkProps.bot_id,
      role: 'user',
      type: 'question',
      section_id: '123',
      content_type: ContentType.Text,
      content: 'Hello, world!',
      message_id: '',
      content_obj: 'Hello, world!',
      message_status: undefined,
      preset_bot: undefined,
      reply_id: '',
      user: 'user123',
      file_upload_result: undefined,
      local_message_status: 'unsent',
      extra_info: {
        bot_state: '',
        input_tokens: '',
        // local_message_id: 'jmRr6hcOhgQX-vjzhQ9Tc',
        output_tokens: '',
        plugin: '',
        plugin_request: '',
        plugin_status: 'success',
        time_cost: '',
        token: '',
        tool_name: '',
        workflow_tokens: '',
      },
    };

    // Prepare
    const props: TextMessageProps = {
      payload: {
        text: 'Hello, world!',
        mention_list: [],
      },
    };
    const options = { section_id: '123' };

    // Execute
    const message = chat.createTextMessage(props, options);

    // Assert
    expect(message).toMatchObject(messageStand);
    expect(message.extra_info).toHaveProperty('local_message_id');
    expect(message.extra_info.local_message_id).toBeDefined();
  });

  it('createImageMessage', () => {
    const imageContentObj = {
      image_list: [
        {
          key: '',
          image_thumb: {
            url: 'mocked URL',
            width: 0,
            height: 0,
          },
          image_ori: {
            url: 'mocked URL',
            width: 0,
            height: 0,
          },
          feedback: null,
        },
      ],
    };
    // Standard Output Message
    const messageStand = {
      bot_id: sdkProps.bot_id,
      role: 'user',
      type: 'question',
      section_id: '123',
      content_type: ContentType.Image,
      content: JSON.stringify(imageContentObj),
      message_id: '',
      content_obj: imageContentObj,
      message_status: undefined,
      preset_bot: undefined,
      reply_id: '',
      user: 'user123',
      file_upload_result: undefined,
      local_message_status: 'unsent',
      extra_info: {
        bot_state: '',
        input_tokens: '',
        // local_message_id: 'jmRr6hcOhgQX-vjzhQ9Tc',
        output_tokens: '',
        plugin: '',
        plugin_request: '',
        plugin_status: 'success',
        time_cost: '',
        token: '',
        tool_name: '',
        workflow_tokens: '',
      },
    };

    // Prepare
    const props = {
      payload: {
        file: {},
        mention_list: [],
      },
    };
    const options = { section_id: '123' };

    // Register plugin
    // @ts-expect-error -- test file ignored
    chat.registerPlugin('upload-plugin', ChatCoreUploadPlugin, {
      userId: '123',
      appId: 123,
    });

    // Execute
    // @ts-expect-error -- test file
    const message = chat.createImageMessage(props, options);

    // Assert
    expect(message).toMatchObject(messageStand);
    expect(message.extra_info.local_message_id).toBeDefined();
  });

  it('createFileMessage', () => {
    const fileContentObj = {
      file_list: [
        {
          file_key: '',
          file_name: 'file.pdf',
          file_type: 'pdf',
          file_size: 100,
          file_url: '',
        },
      ],
    };
    // Standard Output Message
    const messageStand = {
      bot_id: sdkProps.bot_id,
      role: 'user',
      type: 'question',
      section_id: '123',
      content_type: ContentType.File,
      content: JSON.stringify(fileContentObj),
      message_id: '',
      content_obj: fileContentObj,
      message_status: undefined,
      preset_bot: undefined,
      reply_id: '',
      user: 'user123',
      file_upload_result: undefined,
      local_message_status: 'unsent',
      extra_info: {
        bot_state: '',
        input_tokens: '',
        // local_message_id: 'jmRr6hcOhgQX-vjzhQ9Tc',
        output_tokens: '',
        plugin: '',
        plugin_request: '',
        plugin_status: 'success',
        time_cost: '',
        token: '',
        tool_name: '',
        workflow_tokens: '',
      },
    };

    // Prepare
    const props = {
      payload: {
        file: {
          name: 'file.pdf',
          size: 100,
          type: 'pdf',
        },
        mention_list: [],
      },
    };
    const options = { section_id: '123' };

    // Execute
    // @ts-expect-error -- test file
    const message = chat.createFileMessage(props, options);

    // Assert
    expect(message).toMatchObject(messageStand);
    expect(message.extra_info.local_message_id).toBeDefined();
  });

  it('createTextAndFileMixMessage', () => {
    const props: TextAndFileMixMessageProps = {
      payload: {
        mixList: [
          {
            type: ContentType.Text,
            text: 'Hello',
          },
          {
            type: ContentType.File,
            // @ts-expect-error -- test file
            file: {
              type: 'pdf',
              name: 'file.pdf',
              size: 1234,
            },
            uri: 'file://file.pdf',
          },
          {
            type: ContentType.Image,
            // @ts-expect-error -- test file
            file: {
              type: 'png',
              name: 'image.png',
              size: 1234,
            },
            width: 10,
            height: 10,
            uri: 'file://image.png',
          },
        ],
        mention_list: [],
      },
    };
    const options = { section_id: '123' };

    const messageContentObj = {
      item_list: [
        {
          type: 'text',
          text: 'Hello',
        },
        {
          type: 'file',
          file: {
            file_key: 'file://file.pdf',
            file_name: 'file.pdf',
            file_type: 'pdf',
            file_size: 1234,
            file_url: '',
          },
        },
        {
          type: 'image',
          image: {
            key: 'file://image.png',
            image_thumb: {
              url: 'mocked URL',
              width: 10,
              height: 10,
            },
            image_ori: {
              url: 'mocked URL',
              width: 10,
              height: 10,
            },
            feedback: null,
          },
        },
      ],
    };

    // Standard Output Message
    const messageStand = {
      bot_id: sdkProps.bot_id,
      role: 'user',
      type: 'question',
      section_id: '123',
      content_type: ContentType.Mix,
      content: JSON.stringify(messageContentObj),
      message_id: '',
      content_obj: messageContentObj,
      message_status: undefined,
      preset_bot: undefined,
      reply_id: '',
      user: 'user123',
      file_upload_result: undefined,
      local_message_status: 'unsent',
      extra_info: {
        bot_state: '',
        input_tokens: '',
        // local_message_id: 'jmRr6hcOhgQX-vjzhQ9Tc',
        output_tokens: '',
        plugin: '',
        plugin_request: '',
        plugin_status: 'success',
        time_cost: '',
        token: '',
        tool_name: '',
        workflow_tokens: '',
      },
    };

    // Execute
    const message = chat.createTextAndFileMixMessage(props, options);

    // Assert
    expect(message).toMatchObject(messageStand);
    expect(message.extra_info.local_message_id).toBeDefined();
  });

  it('createNormalizedPayloadMessage', () => {
    const props: NormalizedMessageProps<ContentType.Image> = {
      payload: {
        contentType: ContentType.Image,
        contentObj: {
          image_list: [
            {
              key: '12344111',
              image_thumb: {
                url: 'mocked URL',
                width: 0,
                height: 0,
              },
              image_ori: {
                url: 'mocked URL',
                width: 0,
                height: 0,
              },
              feedback: null,
            },
          ],
        },
        mention_list: [],
      },
    };
    const options = { section_id: '123' };

    const imageContentObj = {
      image_list: [
        {
          key: '12344111',
          image_thumb: {
            url: 'mocked URL',
            width: 0,
            height: 0,
          },
          image_ori: {
            url: 'mocked URL',
            width: 0,
            height: 0,
          },
          feedback: null,
        },
      ],
    };

    // Standard Output Message
    const messageStand = {
      bot_id: sdkProps.bot_id,
      role: 'user',
      type: 'question',
      section_id: '123',
      content_type: ContentType.Image,
      content: JSON.stringify(imageContentObj),
      message_id: '',
      content_obj: imageContentObj,
      message_status: undefined,
      preset_bot: undefined,
      reply_id: '',
      user: 'user123',
      file_upload_result: 'success',
      local_message_status: 'unsent',
      extra_info: {
        bot_state: '',
        input_tokens: '',
        // local_message_id: 'jmRr6hcOhgQX-vjzhQ9Tc',
        output_tokens: '',
        plugin: '',
        plugin_request: '',
        plugin_status: 'success',
        time_cost: '',
        token: '',
        tool_name: '',
        workflow_tokens: '',
      },
    };

    // Execute
    const message = chat.createNormalizedPayloadMessage(props, options);

    // Assert
    expect(message).toMatchObject(messageStand);
    expect(message.extra_info.local_message_id).toBeDefined();
  });
});
