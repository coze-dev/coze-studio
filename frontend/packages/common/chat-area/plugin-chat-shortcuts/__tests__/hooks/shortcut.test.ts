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

import { ContentType, useSendTextMessage } from '@coze-common/chat-area';
import { sendTeaEvent, EVENT_NAMES } from '@coze-arch/bot-tea';
import { type ShortCutCommand } from '@coze-agent-ide/tool-config';

import {
  useSendTextQueryMessage,
  useSendUseToolMessage,
  getTemplateQuery,
  getImageAndFileList,
} from '../../src/hooks/shortcut';

const sendTextMessageMock = vi.fn();
const sendMultimodalMessage = vi.fn();
vi.mock('@coze-arch/bot-tea', () => ({
  sendTeaEvent: vi.fn(),
  EVENT_NAMES: {
    page_view: 'page_view',
  },
}));
vi.mock('../../src/shortcut-tool/shortcut-edit/method', () => ({
  enableSendTypePanelHideTemplate: vi.fn(),
}));
vi.mock('@coze-common/chat-area', () => ({
  useSendTextMessage: () => sendTextMessageMock,
  useSendMultimodalMessage: () => sendMultimodalMessage,
  ContentType: {
    Image: 'image',
    File: 'file',
  },
}));

vi.mock('@coze-common/chat-core', () => ({
  default: () => vi.fn(),
  getFileInfo: vi.fn().mockImplementation(file => {
    if (file.type === 'image/png') {
      return {
        fileType: 'image',
      };
    }
    return {
      fileType: 'file',
    };
  }),
}));

const mockShortcut: ShortCutCommand = {
  command_id: '7374755905893793836',
  command_name: 'muti',
  components_list: [
    {
      name: 'news',
      description: 'Keywords to search for news, must in English',
      input_type: 0,
      parameter: 'q',
      options: [],
    },
  ],
  description: '',
  object_id: '7374633552917479468',
  plugin_api_name: 'getNews',
  plugin_id: '7373521805258014764',
  send_type: 1,
  shortcut_command: '/muti',
  template_query: '查询{{news}}',
  tool_type: 2,
  tool_info: {
    tool_name: 'News',
    tool_params_list: [
      {
        default_value: '',
        desc: 'Keywords to search for news, must in English',
        name: 'q',
        refer_component: true,
        required: true,
        type: 'string',
      },
    ],
    // @ts-expect-error -- test ignore
    tool_type: 2,
  },
  work_flow_id: '',
};

describe('useSendTextQueryMessage', () => {
  it('should send text message with query template', () => {
    const sendTextMessage = useSendTextMessage();
    const sendTextQueryMessage = useSendTextQueryMessage();
    mockShortcut.tool_type = undefined;
    sendTextQueryMessage({
      queryTemplate: 'test',
      shortcut: mockShortcut,
    });
    expect(sendTextMessage).toHaveBeenCalledWith(
      { text: 'test', mentionList: [] },
      'shortcut',
      {
        extendFiled: {
          device_id: expect.any(String),
        },
      },
    );
    expect(sendTeaEvent).toHaveBeenCalledWith(EVENT_NAMES.shortcut_use, {
      show_panel: undefined,
      tool_type: undefined,
      use_components: true,
    });
  });
  it('should send modify message with onBeforeSend', () => {
    const sendTextQueryMessage = useSendTextQueryMessage();
    const defaultOptions = {
      extendFiled: {
        device_id: expect.any(String),
      },
    };
    const onBeforeSendMock = vi.fn().mockReturnValue({
      message: {
        payload: {
          text: 'modified query template',
          mention_list: [{ id: 123 }],
        },
      },
      options: {
        ...defaultOptions,
        test: '123',
      },
    });
    sendTextQueryMessage({
      queryTemplate: 'test',
      onBeforeSend: onBeforeSendMock,
      shortcut: mockShortcut,
    });
  });
});

describe('useSendUseToolMessage', () => {
  it('should send multimodal message with shortcut command', () => {
    const sendUseToolMessage = useSendUseToolMessage();
    const shortcut = {
      command_id: '7374755905893793836',
      command_name: 'muti',
      components_list: [
        {
          name: 'news',
          description: 'Keywords to search for news, must in English',
          input_type: 0,
          parameter: 'q',
          options: [],
        },
      ],
      description: '',
      object_id: '7374633552917479468',
      plugin_api_name: 'getNews',
      plugin_id: '7373521805258014764',
      send_type: 1,
      tool_type: 2,
      shortcut_command: '/muti',
      template_query: '查询{{news}}',
      tool_info: {
        tool_name: 'News',
        tool_params_list: [
          {
            default_value: '',
            desc: 'Keywords to search for news, must in English',
            name: 'q',
            refer_component: true,
            required: true,
            type: 'string',
          },
        ],
        tool_type: 2,
      },
      work_flow_id: '',
    };
    const componentsFormValues = { news: '查询北京news' };
    // @ts-expect-error -- single test ignored
    sendUseToolMessage({ shortcut, componentsFormValues });
    expect(sendMultimodalMessage).toHaveBeenCalled();
    expect(sendTeaEvent).toHaveBeenCalledWith(EVENT_NAMES.shortcut_use, {
      show_panel: true,
      tool_type: 2,
      use_components: true,
    });
  });
});

describe('getTemplateQuery', () => {
  it('should return query from template', () => {
    const shortcut = {
      command_id: '7374755905893793836',
      command_name: 'muti',
      components_list: [
        {
          name: 'news',
          description: 'Keywords to search for news, must in English',
          input_type: 0,
          parameter: 'q',
          options: [],
        },
      ],
      description: '',
      object_id: '7374633552917479468',
      plugin_api_name: 'getNews',
      plugin_id: '7373521805258014764',
      send_type: 1,
      shortcut_command: '/muti',
      template_query: '查询{{news}}',
      tool_info: {
        tool_name: 'News',
        tool_params_list: [
          {
            default_value: '',
            desc: 'Keywords to search for news, must in English',
            name: 'q',
            refer_component: true,
            required: true,
            type: 'string',
          },
        ],
        tool_type: 2,
      },
      work_flow_id: '',
    };
    const componentsFormValues = { news: '北京新闻' };
    // @ts-expect-error -- single test ignored
    const result = getTemplateQuery(shortcut, componentsFormValues);
    expect(result).toBe('查询北京新闻');
  });

  it('should throw error when template_query is not defined', () => {
    const shortcut = {
      command_id: '7374755905893793836',
      command_name: 'muti',
      components_list: [
        {
          name: 'news',
          description: 'Keywords to search for news, must in English',
          input_type: 0,
          parameter: 'q',
          options: [],
        },
      ],
      description: '',
      object_id: '7374633552917479468',
      plugin_api_name: 'getNews',
      plugin_id: '7373521805258014764',
      send_type: 1,
      shortcut_command: '/muti',
      tool_info: {
        tool_name: 'News',
        tool_params_list: [
          {
            default_value: '',
            desc: 'Keywords to search for news, must in English',
            name: 'q',
            refer_component: true,
            required: true,
            type: 'string',
          },
        ],
        tool_type: 2,
      },
      work_flow_id: '',
    };
    const componentsFormValues = { news: '北京新闻' };
    // @ts-expect-error -- single test ignored
    expect(() => getTemplateQuery(shortcut, componentsFormValues)).toThrowError(
      'template_query is not defined',
    );
  });
});

describe('getImageAndFileList', () => {
  it('should return list of images and files', () => {
    const componentsFormValues = {
      image: {
        fileInstance: new File([''], 'filename', { type: 'image/png' }),
        url: 'http://example.com/image.png',
        width: 100,
        height: 100,
      },
      file: {
        fileInstance: new File([''], 'filename', { type: 'text/plain' }),
        url: 'http://example.com/file.txt',
      },
    };
    const result = getImageAndFileList(componentsFormValues);
    expect(result).toEqual([
      {
        type: ContentType.Image,
        file: componentsFormValues.image.fileInstance,
        uri: componentsFormValues.image.url,
        width: componentsFormValues.image.width,
        height: componentsFormValues.image.height,
      },
      {
        type: ContentType.File,
        file: componentsFormValues.file.fileInstance,
        uri: componentsFormValues.file.url,
      },
    ]);
  });
});
