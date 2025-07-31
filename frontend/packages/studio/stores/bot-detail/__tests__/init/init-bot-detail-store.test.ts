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

import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
  afterEach,
  type Mock,
} from 'vitest';
import { createReportEvent } from '@coze-arch/report-events';
import { type BotMonetizationConfigData } from '@coze-arch/idl/benefit';
import { type GetDraftBotInfoAgwData } from '@coze-arch/bot-api/playground_api';

import { getBotDataService } from '../../src/services/get-bot-data-service';
import { initBotDetailStore } from '../../src/init/init-bot-detail-store';

// Mock dependencies
vi.mock('@coze-arch/report-events', () => ({
  REPORT_EVENTS: {
    botDebugGetRecord: 'botDebugGetRecord',
    botGetDraftBotInfo: 'botGetDraftBotInfo',
  },
  createReportEvent: vi.fn(),
}));

vi.mock('../../src/services/get-bot-data-service');

const mockBotInfoStore = {
  botId: 'test-bot-id',
  version: '1.0',
  initStore: vi.fn(),
};
const mockPageRuntimeStore = {
  setPageRuntimeBotInfo: vi.fn(),
  initStore: vi.fn(),
};
const mockBotDetailStoreSet = {
  clear: vi.fn(),
};
const mockCollaborationStore = {
  initStore: vi.fn(),
};
const mockPersonaStore = {
  initStore: vi.fn(),
};
const mockModelStore = {
  initStore: vi.fn(),
};
const mockBotSkillStore = {
  initStore: vi.fn(),
};
const mockMultiAgentStore = {
  initStore: vi.fn(),
};
const mockMonetizeConfigStore = {
  initStore: vi.fn(),
};
const mockQueryCollectStore = {
  initStore: vi.fn(),
};
const mockAuditInfoStore = {
  initStore: vi.fn(),
};

vi.mock('../src/store/audit-info', () => ({
  useAuditInfoStore: {
    getState: vi.fn(() => mockAuditInfoStore),
  },
}));
vi.mock('../src/store/query-collect', () => ({
  useQueryCollectStore: {
    getState: vi.fn(() => mockQueryCollectStore),
  },
}));
vi.mock('../src/store/persona', () => ({
  usePersonaStore: {
    getState: vi.fn(() => mockPersonaStore),
  },
}));
vi.mock('../src/store/page-runtime', () => ({
  usePageRuntimeStore: {
    getState: vi.fn(() => mockPageRuntimeStore),
  },
}));
vi.mock('../src/store/multi-agent', () => ({
  useMultiAgentStore: {
    getState: vi.fn(() => mockMultiAgentStore),
  },
}));
vi.mock('../src/store/monetize-config-store', () => ({
  useMonetizeConfigStore: {
    getState: vi.fn(() => mockMonetizeConfigStore),
  },
}));
vi.mock('../src/store/model', () => ({
  useModelStore: {
    getState: vi.fn(() => mockModelStore),
  },
}));
vi.mock('../src/store/index', () => ({
  useBotDetailStoreSet: mockBotDetailStoreSet,
}));
vi.mock('../src/store/collaboration', () => ({
  useCollaborationStore: {
    getState: vi.fn(() => mockCollaborationStore),
  },
}));
vi.mock('../src/store/bot-skill', () => ({
  useBotSkillStore: {
    getState: vi.fn(() => mockBotSkillStore),
  },
}));
vi.mock('../src/store/bot-info', () => ({
  useBotInfoStore: {
    getState: vi.fn(() => mockBotInfoStore),
  },
}));

describe('initBotDetailStore', () => {
  const mockSuccessReportEvent = { success: vi.fn(), error: vi.fn() };
  const mockErrorGetBotInfoReportEvent = { success: vi.fn(), error: vi.fn() };

  const mockBotData: GetDraftBotInfoAgwData = {
    bot_info: { bot_id: 'test-bot-id', name: 'Test Bot' },
    // Add other necessary fields for GetDraftBotInfoAgwData
  } as GetDraftBotInfoAgwData; // Cast to avoid filling all fields for test
  const mockMonetizeConfig: BotMonetizationConfigData = {
    // Add necessary fields for BotMonetizationConfigData
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (createReportEvent as Mock)
      .mockReturnValueOnce(mockSuccessReportEvent) // For botDebugGetRecord
      .mockReturnValueOnce(mockErrorGetBotInfoReportEvent); // For botGetDraftBotInfo
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should initialize stores correctly for "bot" scene with version', async () => {
    (getBotDataService as Mock).mockResolvedValue({
      botData: mockBotData,
      monetizeConfig: mockMonetizeConfig,
    });

    const params = { version: '2.0', scene: 'bot' as const };
    await initBotDetailStore(params);

    expect(mockSuccessReportEvent.success).toHaveBeenCalled();
  });

  it('should initialize stores correctly for "market" scene without version', async () => {
    (getBotDataService as Mock).mockResolvedValue({
      botData: mockBotData,
      monetizeConfig: mockMonetizeConfig,
    });

    const params = { scene: 'market' as const };
    await initBotDetailStore(params);

    expect(mockErrorGetBotInfoReportEvent.success).toHaveBeenCalled();
    expect(mockSuccessReportEvent.success).toHaveBeenCalled();
  });

  it('should handle errors from getBotDataService', async () => {
    const error = new Error('Failed to fetch bot data');
    (getBotDataService as Mock).mockRejectedValue(error);

    await expect(initBotDetailStore()).rejects.toThrow(error);

    expect(getBotDataService).toHaveBeenCalled();
    expect(mockErrorGetBotInfoReportEvent.error).toHaveBeenCalledWith({
      reason: 'get new draft bot info fail',
      error,
    });
    expect(mockSuccessReportEvent.error).toHaveBeenCalledWith({
      reason: 'init fail',
      error,
    });
  });

  it('should use default scene "bot" if not provided', async () => {
    (getBotDataService as Mock).mockResolvedValue({
      botData: mockBotData,
      monetizeConfig: mockMonetizeConfig,
    });
    await initBotDetailStore({}); // Empty params

    expect(getBotDataService).toHaveBeenCalledWith(
      expect.objectContaining({
        scene: 'bot',
      }),
    );
  });
});
