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

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { REPORT_EVENTS } from '@coze-arch/report-events';
import { reporter } from '@coze-arch/logger';
import { BotPageFromEnum } from '@coze-arch/bot-typings/common';
import { PlaygroundApi } from '@coze-arch/bot-api';

import { usePageRuntimeStore } from '../../../src/store/page-runtime';
import { useCollaborationStore } from '../../../src/store/collaboration';
import { useBotInfoStore } from '../../../src/store/bot-info';
import {
  saveFetcher,
  updateBotRequest,
} from '../../../src/save-manager/utils/save-fetcher';

// simulated dependency
vi.mock('@coze-arch/logger', () => ({
  reporter: {
    successEvent: vi.fn(),
    errorEvent: vi.fn(),
  },
}));

vi.mock('@coze-arch/bot-api', () => ({
  PlaygroundApi: {
    UpdateDraftBotInfoAgw: vi.fn(),
  },
}));

vi.mock('../../../src/store/page-runtime', () => ({
  usePageRuntimeStore: {
    getState: vi.fn(),
  },
}));

vi.mock('../../../src/store/collaboration', () => ({
  useCollaborationStore: {
    getState: vi.fn(),
  },
}));

vi.mock('../../../src/store/bot-info', () => ({
  useBotInfoStore: {
    getState: vi.fn(),
  },
}));

vi.mock('../../../src/utils/storage', () => ({
  storage: {
    baseVersion: 'mock-base-version',
  },
}));

vi.mock('dayjs', () => {
  const mockDayjs = vi.fn(() => ({
    format: vi.fn(() => '12:34:56'),
  }));
  return {
    default: mockDayjs,
  };
});

describe('save-fetcher utils', () => {
  const mockSetPageRuntimeByImmer = vi.fn();
  const mockSetCollaborationByImmer = vi.fn();
  const mockSaveRequest = vi.fn();
  const mockScopeKey = 123;

  beforeEach(() => {
    vi.clearAllMocks();

    // Set default state
    (usePageRuntimeStore.getState as any).mockReturnValue({
      editable: true,
      isPreview: false,
      pageFrom: BotPageFromEnum.Detail,
      init: true,
      savingInfo: {},
      setPageRuntimeByImmer: mockSetPageRuntimeByImmer,
    });

    (useCollaborationStore.getState as any).mockReturnValue({
      setCollaborationByImmer: mockSetCollaborationByImmer,
      branch: { id: 'branch-id' },
    });

    (useBotInfoStore.getState as any).mockReturnValue({
      botId: 'mock-bot-id',
    });

    mockSaveRequest.mockResolvedValue({
      data: {
        has_change: true,
        same_with_online: false,
        branch: { id: 'updated-branch-id' },
      },
    });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('saveFetcher', () => {
    it('应该在只读模式下不执行任何操作', async () => {
      // Set to read-only mode
      (usePageRuntimeStore.getState as any).mockReturnValue({
        editable: false,
        isPreview: false,
        pageFrom: BotPageFromEnum.Detail,
        init: true,
      });

      await saveFetcher(mockSaveRequest, mockScopeKey as any);

      expect(mockSaveRequest).not.toHaveBeenCalled();
      expect(mockSetPageRuntimeByImmer).not.toHaveBeenCalled();
      expect(reporter.successEvent).not.toHaveBeenCalled();
    });

    it('应该在预览模式下不执行任何操作', async () => {
      // Set to preview mode
      (usePageRuntimeStore.getState as any).mockReturnValue({
        editable: true,
        isPreview: true,
        pageFrom: BotPageFromEnum.Detail,
        init: true,
      });

      await saveFetcher(mockSaveRequest, mockScopeKey as any);

      expect(mockSaveRequest).not.toHaveBeenCalled();
      expect(mockSetPageRuntimeByImmer).not.toHaveBeenCalled();
      expect(reporter.successEvent).not.toHaveBeenCalled();
    });

    it('应该在探索模式下不执行任何操作', async () => {
      // Set to exploration mode
      (usePageRuntimeStore.getState as any).mockReturnValue({
        editable: true,
        isPreview: false,
        pageFrom: BotPageFromEnum.Explore,
        init: true,
      });

      await saveFetcher(mockSaveRequest, mockScopeKey as any);

      expect(mockSaveRequest).not.toHaveBeenCalled();
      expect(mockSetPageRuntimeByImmer).not.toHaveBeenCalled();
      expect(reporter.successEvent).not.toHaveBeenCalled();
    });

    it('应该在未初始化时不执行任何操作', async () => {
      // Set to uninitialized
      (usePageRuntimeStore.getState as any).mockReturnValue({
        editable: true,
        isPreview: false,
        pageFrom: BotPageFromEnum.Detail,
        init: false,
      });

      await saveFetcher(mockSaveRequest, mockScopeKey as any);

      expect(mockSaveRequest).not.toHaveBeenCalled();
      expect(mockSetPageRuntimeByImmer).not.toHaveBeenCalled();
      expect(reporter.successEvent).not.toHaveBeenCalled();
    });

    it('应该在可编辑模式下正确执行保存操作', async () => {
      await saveFetcher(mockSaveRequest, mockScopeKey as any);

      // Verify settings save state
      expect(mockSetPageRuntimeByImmer).toHaveBeenCalledTimes(3);
      // Verify First Call - Set Saved State
      const firstCall = mockSetPageRuntimeByImmer.mock.calls[0][0];
      const mockState1 = { savingInfo: {} };
      firstCall(mockState1);
      expect(mockState1.savingInfo.saving).toBe(true);
      expect(mockState1.savingInfo.scopeKey).toBe(String(mockScopeKey));

      // Verify that the save request was invoked
      expect(mockSaveRequest).toHaveBeenCalledTimes(1);

      // Verify Second Call - Set Save Complete Status
      const secondCall = mockSetPageRuntimeByImmer.mock.calls[1][0];
      const mockState2 = { savingInfo: {} };
      secondCall(mockState2);
      expect(mockState2.savingInfo.saving).toBe(false);
      expect(mockState2.savingInfo.time).toBe('12:34:56');

      // Verify Third Call - Set Unpublished Change Status
      const thirdCall = mockSetPageRuntimeByImmer.mock.calls[2][0];
      const mockState3 = {};
      thirdCall(mockState3);
      expect(mockState3.hasUnpublishChange).toBe(true);

      // Verify settings collaboration status
      expect(mockSetCollaborationByImmer).toHaveBeenCalledTimes(1);
      const collaborationCall = mockSetCollaborationByImmer.mock.calls[0][0];
      const mockCollabState = { branch: { id: 'branch-id' } };
      collaborationCall(mockCollabState);
      expect(mockCollabState.sameWithOnline).toBe(false);
      expect(mockCollabState.branch).toEqual({ id: 'updated-branch-id' });

      // Validation success events are reported
      expect(reporter.successEvent).toHaveBeenCalledWith({
        eventName: REPORT_EVENTS.AutosaveSuccess,
        meta: { itemType: mockScopeKey },
      });
    });

    it('应该处理保存请求失败的情况', async () => {
      const mockError = new Error('Save failed');
      mockSaveRequest.mockRejectedValue(mockError);

      await saveFetcher(mockSaveRequest, mockScopeKey as any);

      // Verify settings save status
      expect(mockSetPageRuntimeByImmer).toHaveBeenCalledTimes(1);

      // Verify that the save request was invoked
      expect(mockSaveRequest).toHaveBeenCalledTimes(1);

      // Validation error events are reported
      expect(reporter.errorEvent).toHaveBeenCalledWith({
        eventName: REPORT_EVENTS.AutosaveError,
        error: mockError,
        meta: { itemType: mockScopeKey },
      });
    });

    it('应该处理没有分支信息的响应', async () => {
      mockSaveRequest.mockResolvedValue({
        data: {
          has_change: true,
          same_with_online: false,
          // No branch information
        },
      });

      await saveFetcher(mockSaveRequest, mockScopeKey as any);

      // Verify settings collaboration status
      expect(mockSetCollaborationByImmer).toHaveBeenCalledTimes(1);
      const collaborationCall = mockSetCollaborationByImmer.mock.calls[0][0];
      const mockCollabState = { branch: { id: 'branch-id' } };
      collaborationCall(mockCollabState);
      expect(mockCollabState.sameWithOnline).toBe(false);
      // Branch information should remain unchanged
      expect(mockCollabState.branch).toEqual({ id: 'branch-id' });
    });
  });

  describe('updateBotRequest', () => {
    it('应该正确构造更新请求', () => {
      const mockPayload = { some_field: 'some_value' };

      (PlaygroundApi.UpdateDraftBotInfoAgw as any).mockResolvedValue({
        data: { success: true },
      });

      updateBotRequest(mockPayload as any);

      expect(PlaygroundApi.UpdateDraftBotInfoAgw).toHaveBeenCalledWith({
        bot_info: {
          bot_id: 'mock-bot-id',
          some_field: 'some_value',
        },
        base_commit_version: 'mock-base-version',
      });
    });
  });
});
