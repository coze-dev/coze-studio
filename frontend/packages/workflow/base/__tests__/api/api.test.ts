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

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { workflowApi as archWorkflowApi } from '@coze-arch/bot-api';

import { workflowApi, workflowQueryClient } from '../../src/api';

vi.mock('@coze-arch/bot-api', () => ({
  workflowApi: {
    GetHistorySchema: vi.fn(),
    GetWorkFlowProcess: vi.fn(),
    GetCanvasInfo: vi.fn(),
    OPGetHistorySchema: vi.fn(),
    OPGetWorkFlowProcess: vi.fn(),
    OPGetCanvasInfo: vi.fn(),
  },
}));

const mockParams = {
  space_id: '123',
  workflow_id: '456',
  commit_id: '789',
  type: 1,
};

describe('api/index.ts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should export workflowApi', () => {
    expect(workflowApi).toBeDefined();
  });

  it('should export workflowQueryClient', () => {
    expect(workflowQueryClient).toBeDefined();
  });

  describe('workflowApi proxy', () => {
    it('should call original API methods in non-OP environment', () => {
      // @ts-expect-error IS_BOT_OP is a global variable defined in runtime
      global.IS_BOT_OP = false;

      workflowApi.GetHistorySchema(mockParams);
      expect(archWorkflowApi.GetHistorySchema).toHaveBeenCalledWith(mockParams);

      workflowApi.GetWorkFlowProcess({
        space_id: mockParams.space_id,
        workflow_id: mockParams.workflow_id,
      });
      expect(archWorkflowApi.GetWorkFlowProcess).toHaveBeenCalledWith({
        space_id: mockParams.space_id,
        workflow_id: mockParams.workflow_id,
      });

      workflowApi.GetCanvasInfo({ space_id: mockParams.space_id });
      expect(archWorkflowApi.GetCanvasInfo).toHaveBeenCalledWith({
        space_id: mockParams.space_id,
      });
    });

    it('should call OP API methods in OP environment', () => {
      // @ts-expect-error IS_BOT_OP is a global variable defined in runtime
      global.IS_BOT_OP = true;

      workflowApi.GetHistorySchema(mockParams);
      expect(archWorkflowApi.OPGetHistorySchema).toHaveBeenCalledWith(
        mockParams,
      );

      workflowApi.GetWorkFlowProcess({
        space_id: mockParams.space_id,
        workflow_id: mockParams.workflow_id,
      });
      expect(archWorkflowApi.OPGetWorkFlowProcess).toHaveBeenCalledWith({
        space_id: mockParams.space_id,
        workflow_id: mockParams.workflow_id,
      });

      workflowApi.GetCanvasInfo({ space_id: mockParams.space_id });
      expect(archWorkflowApi.OPGetCanvasInfo).toHaveBeenCalledWith({
        space_id: mockParams.space_id,
      });
    });
  });
});
