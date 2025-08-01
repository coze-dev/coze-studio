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

import { TabStatus } from '@coze-arch/bot-api/playground_api';

vi.stubGlobal('IS_DEV_MODE', false);
vi.stubGlobal('IS_OVERSEA', false);
// vi.mock('zustand');

vi.mock('@coze-arch/bot-semi', () => ({
  Toast: {
    success: vi.fn(),
  },
  UIToast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));
vi.mock('@coze-arch/bot-studio-store', () => ({}));
vi.mock('@coze-arch/bot-flags', () => ({
  getFlags: () =>
    new Proxy(
      {},
      {
        get: () => true,
      },
    ),
}));

vi.mock('@coze-arch/bot-utils', () => ({
  safeJSONParse: vi.fn(),
}));

vi.mock('@coze-arch/i18n', () => ({
  I18n: { t: vi.fn() },
}));

vi.mock('@coze-arch/bot-error', () => ({
  CustomError: vi.fn(),
}));

vi.mock('@coze-arch/logger', () => ({
  reporter: {
    errorEvent: vi.fn(),
  },
}));

vi.mock('@coze-arch/bot-studio-store', () => ({
  useSpaceStore: {
    getState: () => ({
      space: {
        id: 'fake space id',
      },
      getSpaceId: () => 'fake space id',
    }),
  },
}));

vi.mock('@coze-arch/bot-space-api', () => ({
  SpaceApi: {
    CreateChatflowAgent: vi
      .fn()
      .mockResolvedValueOnce({ code: 1 })
      .mockResolvedValueOnce({ agentData: {} })
      .mockResolvedValueOnce({
        agentData: {
          agentInfo: {
            id: 'fake agent ID',
          },
          branch: 'fake branch',
          // same_with_online: true,
        },
      })
      .mockResolvedValueOnce({ code: 1 })
      .mockResolvedValueOnce({ agentData: {} })
      .mockResolvedValueOnce({
        agentData: {
          agentInfo: {
            id: 'fake agent ID',
          },
          branch: 'fake branch',
          same_with_online: true,
        },
      }),

    CopyChatflowAgent: vi
      .fn()
      .mockResolvedValueOnce({ code: 1 })
      .mockResolvedValueOnce({ agentData: {} })
      .mockResolvedValueOnce({
        agentData: {
          agentInfo: {
            id: 'fake agent ID',
          },
          branch: 'fake branch',
        },
      })
      .mockResolvedValueOnce({ code: 1 })
      .mockResolvedValueOnce({ agentData: {} })
      .mockResolvedValueOnce({
        agentData: {
          agentInfo: {
            id: 'fake agent ID',
          },
          branch: 'fake branch',
          same_with_online: true,
        },
      }),
    GetDraftBotDisplayInfo: vi
      .fn()
      .mockRejectedValueOnce('error')
      .mockResolvedValueOnce({ code: 1 })
      .mockResolvedValueOnce({ data: {} })
      .mockResolvedValueOnce({
        data: {
          tab_display_info: {
            plugin_tab_status: TabStatus.Close,
            workflow_tab_status: TabStatus.Open,
            knowledge_tab_status: TabStatus.Default,
          },
        },
      }),
    UpdateDraftBotDisplayInfo: vi.fn().mockResolvedValueOnce({ code: 0 }),
  },
}));
vi.mock('@coze-arch/bot-api', () => ({
  DeveloperApi: {
    UpdateDraftBotDisplayInfo: vi
      .fn()
      .mockResolvedValue({
        code: 0,
        msg: '',
        data: {},
      })
      .mockResolvedValue({
        code: 0,
        msg: '',
        data: {},
      })
      .mockResolvedValue({
        code: 0,
        msg: '',
        data: {},
      })
      .mockResolvedValue({
        code: 0,
        msg: '',
        data: {},
      })
      .mockResolvedValue({
        code: 0,
        msg: '',
        data: {},
      })
      .mockResolvedValue({
        code: 0,
        msg: '',
        data: {},
      }),
  },
  PlaygroundApi: {
    BatchCreateAgent: vi
      .fn()
      .mockResolvedValueOnce({ code: 1 })
      .mockResolvedValueOnce({ code: 0, data: [{ agent_id: 'fake' }] })
      .mockResolvedValueOnce({
        code: 0,
        data: [{ agent_id: 'fake', reference_id: 'fake reference id' }],
        same_with_online: false,
        branch: 2,
      }),
    BatchCreateAgentV2: vi
      .fn()
      .mockResolvedValueOnce({ code: 1 })
      .mockResolvedValueOnce({ code: 0, data: [{ agent_id: 'fake' }] })
      .mockResolvedValueOnce({
        code: 0,
        data: [{ agent_id: 'fake', reference_id: 'fake reference id' }],
        same_with_online: false,
        branch: 2,
      }),
    CreateAgentV2: vi
      .fn()
      .mockResolvedValueOnce({ code: 1 })
      .mockResolvedValueOnce({ code: 1 })
      .mockResolvedValueOnce({ code: 1 })
      .mockResolvedValueOnce({
        code: 0,
        same_with_online: true,
        branch: 'fake branch',
      })
      .mockResolvedValueOnce({
        code: 0,
        same_with_online: true,
        branch: 'fake branch',
      })
      .mockResolvedValueOnce({
        code: 0,
        same_with_online: true,
        branch: 'fake branch',
        data: {
          agent_id: 'fake agent id',
        },
      }),
    CopyAgentV2: vi
      .fn()
      .mockResolvedValueOnce({ code: 1 })
      .mockResolvedValueOnce({ data: null })
      .mockResolvedValueOnce({
        data: {
          agent_id: 'fake agent ID',
        },
        branch: 'fake branch',
      }),

    MGetBotByVersion: vi
      .fn()
      .mockResolvedValueOnce({ code: 1 })
      .mockResolvedValueOnce({ code: 1 })
      .mockResolvedValueOnce({
        data: [
          {
            id: 'fake reference id',
            name: 'fake name',
            icon_url: 'fake icon url',
          },
        ],
      })
      .mockResolvedValueOnce({ code: 1 })
      .mockResolvedValueOnce({ code: 1 })
      .mockResolvedValueOnce({
        data: [
          {
            id: 'fake reference id',
            name: 'fake name',
            icon_url: 'fake icon url',
          },
        ],
      }),
  },
}));

vi.mock('@coze-studio/bot-utils', () => ({
  withSlardarIdButton: vi.fn(),
}));
