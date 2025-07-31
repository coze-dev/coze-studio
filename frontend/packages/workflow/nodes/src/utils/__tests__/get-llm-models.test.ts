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
import type { WorkflowDocument } from '@flowgram-adapter/free-layout-editor';
import {
  captureException,
  RESPONSE_FORMAT_NAME,
  ResponseFormat,
  StandardNodeType,
} from '@coze-workflow/base';
import { logger } from '@coze-arch/logger';
import { I18n } from '@coze-arch/i18n';
import { DeveloperApi as developerApi } from '@coze-arch/bot-api';

import { getLLMModels } from '../get-llm-models';
import { mockSchemaForLLM } from './__mocks__/mock-schema';
import { mockLLMModels } from './__mocks__/mock-models';

vi.mock('@coze-arch/bot-api', () => ({
  DeveloperApi: {
    GetTypeList: vi.fn(),
  },
  ModelScene: {
    Douyin: 'douyin_scene',
  },
}));

vi.mock('@coze-arch/logger', () => {
  const mockCreatedLogger = {
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
    log: vi.fn(),
  };
  const mockLogger = {
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
    log: vi.fn(),

    createLoggerWith: vi.fn(() => mockCreatedLogger),
  };
  return {
    __esModule: true, // Indicates that this is an ES module mock
    default: mockLogger, // Mock for `import logger from '@coze-arch/logger'`
    logger: mockLogger, // Mock for `import { logger } from '@coze-arch/logger'`
    reporter: {
      createReporterWithPreset: vi.fn(),
      slardarInstance: vi.fn(),
    },
    createLoggerWith: vi.fn(() => mockCreatedLogger), // Mock for `import { createLoggerWith } from '@coze-arch/logger'`
  };
});

vi.mock('@coze-arch/i18n', () => ({
  I18n: {
    t: vi.fn(key => key), // Simple mock for I18n.t
  },
}));

vi.mock('@coze-workflow/base', async () => {
  const actual = await vi.importActual('@coze-workflow/base');
  return {
    ...actual,
    captureException: vi.fn(),
  };
});

const mockSpaceId = 'space-123';

describe('getLLMModels', () => {
  let mockDocument: WorkflowDocument;
  let mockGetNodeRegistry: Mock;

  beforeEach(() => {
    mockGetNodeRegistry = vi.fn().mockReturnValue({
      meta: {
        getLLMModelIdsByNodeJSON: nodeJSON => {
          if (nodeJSON.type === StandardNodeType.Intent) {
            return nodeJSON?.data?.inputs?.llmParam?.modelType;
          }

          if (nodeJSON.type === StandardNodeType.Question) {
            return nodeJSON?.data?.inputs?.llmParam?.modelType;
          }

          if (nodeJSON.type === StandardNodeType.LLM) {
            return nodeJSON.data.inputs.llmParam.find(
              p => p.name === 'modelType',
            )?.input.value.content;
          }

          return null;
        },
      },
    });
    mockDocument = {
      getNodeRegistry: mockGetNodeRegistry,
    } as unknown as WorkflowDocument;
    vi.mocked(developerApi.GetTypeList).mockResolvedValue(
      JSON.parse(JSON.stringify(mockLLMModels)),
    );
    vi.mocked(I18n.t).mockImplementation(key => key);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch and process model list correctly', async () => {
    const mockInfo = { schema_json: JSON.stringify(mockSchemaForLLM) };

    // Act
    const models = await getLLMModels({
      info: mockInfo,
      spaceId: mockSpaceId,
      document: mockDocument,
      isBindDouyin: false,
    });

    expect(developerApi.GetTypeList).toHaveBeenCalledWith({
      space_id: mockSpaceId,
      model: true,
      cur_model_ids: ['1737521813', '1745219190'],
    });
    expect(models).toBeInstanceOf(Array);
    expect(models.length).toBeGreaterThan(0);

    // Check repairResponseFormatInModelList logic
    models.forEach(model => {
      const responseFormatParam = model.model_params?.find(
        p => p.name === RESPONSE_FORMAT_NAME,
      );
      expect(responseFormatParam).toBeDefined();
      expect(responseFormatParam?.default_val?.default_val).toBe(
        ResponseFormat.JSON,
      );
      expect(responseFormatParam?.options).toEqual([
        { label: 'model_config_history_text', value: ResponseFormat.Text },
        {
          label: 'model_config_history_markdown',
          value: ResponseFormat.Markdown,
        },
        { label: 'model_config_history_json', value: ResponseFormat.JSON },
      ]);
    });
  });

  it('should set model_scene when isBindDouyin is true', async () => {
    const mockInfo = { schema_json: JSON.stringify(mockSchemaForLLM) };

    // The previous interface has 3s cache, you need to wait 3s before calling it.
    await new Promise(resolve => setTimeout(resolve, 3100));

    // Act
    await getLLMModels({
      info: mockInfo,
      spaceId: mockSpaceId,
      document: mockDocument,
      isBindDouyin: true,
    });

    expect(developerApi.GetTypeList).toHaveBeenCalledWith({
      space_id: mockSpaceId,
      model: true,
      cur_model_ids: ['1737521813', '1745219190'],
      model_scene: 1,
    });
  });

  it('should handle API error gracefully', async () => {
    const mockInfo = { schema_json: JSON.stringify(mockSchemaForLLM) };
    const apiError = new Error('API Error');
    vi.mocked(developerApi.GetTypeList).mockRejectedValue(apiError);

    // The previous interface has 3s cache, you need to wait 3s before calling it.
    await new Promise(resolve => setTimeout(resolve, 3100));

    const models = await getLLMModels({
      info: mockInfo as any,
      spaceId: mockSpaceId,
      document: mockDocument,
      isBindDouyin: false,
    });

    expect(models).toEqual([]);
    expect(logger.error).toHaveBeenCalledWith({
      error: apiError,
      eventName: 'api/bot/get_type_list fetch error',
    });
    expect(captureException).toHaveBeenCalledWith(expect.any(Error));
    expect(I18n.t).toHaveBeenCalledWith('workflow_detail_error_message', {
      msg: 'fetch error',
    });
  });
});
