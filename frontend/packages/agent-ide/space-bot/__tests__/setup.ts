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
    MANUAL: 0, // create manually
    RANDOM: 1, // random generation
    LLM: 2,
  },
}));

vi.mock('@coze-arch/bot-hooks', () => ({
  SceneType: {
    BOT__VIEW__WORKFLOW: 'botViewWorkflow',
    /** View the workflow on the bot details page, or create a new workflow but not published, click Return */
    WORKFLOW__BACK__BOT: 'workflowBackBot',
    /** The bot details page creates a workflow and returns it after the workflow is published */
    WORKFLOW_PUBLISHED__BACK__BOT: 'workflowPublishedBackBot',
    /** Bot details page Enter the mock data page */
    BOT__TO__PLUGIN_MOCK_DATA: 'botToPluginMockData',
    /** Workflow details page Enter the mock data page */
    WORKFLOW__TO__PLUGIN_MOCK_DATA: 'workflowToPluginMockData',
    /** Mock set page Enter the mock data page */
    PLUGIN_MOCK_SET__TO__PLUGIN_MOCK_DATA: 'pluginMockSetToPluginMockData',
    /** Bot details page Enter the knowledge page */
    BOT__VIEW__KNOWLEDGE: 'botViewKnowledge',
    /** Knowledge page Click Exit to return to bot details page (not clicked Add) */
    KNOWLEDGE__BACK__BOT: 'knowledgeBackBot',
    /** Knowledge page Click to return to bot details page and add to bot */
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
  createReportEvent: vi.fn().mockReturnValue({
    success: vi.fn(),
    error: vi.fn(),
  }),
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

vi.mock('@coze-arch/coze-design', () => ({
  Toast: {
    success: vi.fn(),
    warning: vi.fn(),
  },
  withField: vi.fn(),
}));
