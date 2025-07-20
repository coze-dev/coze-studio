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
 
import { vi } from 'vitest';
vi.stubGlobal('IS_DEV_MODE', false);

vi.mock('@coze-arch/logger', () => ({
  useErrorHandler: vi.fn().mockReturnValue(vi.fn()),
  logger: {
    error: vi.fn(),
    info: vi.fn(),
  },
  reporter: {
    tracer: vi.fn().mockReturnValue(vi.fn()),
    event: vi.fn(),
    errorEvent: vi.fn(),
  },
}));

vi.mock('@coze-studio/bot-plugin-store', () => ({
  usePluginStore: vi.fn().mockReturnValue({
    pluginInfo: {
      plugin_id: 'plugin_id',
      canEdit: !0,
    },
  }),
}));

vi.mock('@coze-arch/i18n', () => ({
  I18n: {
    t: (key, params = {}) => `Translated: ${key} ${JSON.stringify(params)}`,
  },
}));

vi.mock('@coze-arch/bot-tea', () => ({
  sendTeaEvent: vi.fn(),
  EVENT_NAMES: {
    use_mockset_front: 'use_mockset_front',
    del_mockset_front: 'del_mockset_front',
  },
  ParamsTypeDefine: {},
  PluginMockDataGenerateMode: {
    MANUAL: 0, // 手动创建
    RANDOM: 1, // 随机生成
    LLM: 2,
  },
}));

vi.mock('@coze-arch/bot-hooks', () => ({
  SceneType: {
    BOT__VIEW__WORKFLOW: 'botViewWorkflow',
    /** bot 详情页查看 workflow，或新建 workflow 但未发布，点击返回 */
    WORKFLOW__BACK__BOT: 'workflowBackBot',
    /** bot 详情页创建 workflow，在 workflow 发布后返回 */
    WORKFLOW_PUBLISHED__BACK__BOT: 'workflowPublishedBackBot',
    /** bot 详情页进入 mock data 页面 */
    BOT__TO__PLUGIN_MOCK_DATA: 'botToPluginMockData',
    /** workflow 详情页进入 mock data 页面 */
    WORKFLOW__TO__PLUGIN_MOCK_DATA: 'workflowToPluginMockData',
    /** mock set 页进入 mock data 页面 */
    PLUGIN_MOCK_SET__TO__PLUGIN_MOCK_DATA: 'pluginMockSetToPluginMockData',
    /** bot 详情页进入 knowledge 页面 */
    BOT__VIEW__KNOWLEDGE: 'botViewKnowledge',
    /** knowledge 页面点击退出返回 bot 详情页（未点击添加） */
    KNOWLEDGE__BACK__BOT: 'knowledgeBackBot',
    /** knowledge 页面点击返回 bot 详情页，并添加到 bot */
    KNOWLEDGE__ADD_TO__BOT: 'knowledgeAddToBot',
  },
  usePageJumpService: vi.fn().mockReturnValue({
    jump: vi.fn(),
  }),
}));

vi.mock('@coze-arch/bot-studio-store', () => ({
  useSpaceStore: {
    getState: vi.fn().mockReturnValue({
      getSpaceId: vi.fn().mockReturnValue('spaceId'),
    }),
  },
}));

vi.mock('@coze-arch/report-events', () => ({
  REPORT_EVENTS: {
    pluginIdeInitTrace: 'pluginIdeInitTrace',
    pluginIdeInit: 'pluginIdeInit',
  },
}));

vi.mock('@coze-arch/bot-error', () => ({
  CustomError: vi.fn(),
}));

vi.mock('react-router-dom', () => ({
  useNavigate: vi.fn().mockReturnValue(vi.fn()),
  useParams: vi.fn().mockReturnValue({
    space_id: 'space_id',
    plugin_id: 'plugin_id',
  }),
}));
