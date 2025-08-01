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
import { type Branch, type Committer } from '@coze-arch/bot-api/developer_api';

import { updateHeaderStatus } from '../../src/utils/handle-status';
import { useCollaborationStore } from '../../src/store/collaboration';

// Analog useCollaborationStore
vi.mock('../../src/store/collaboration', () => ({
  useCollaborationStore: {
    getState: vi.fn().mockReturnValue({
      setCollaborationByImmer: vi.fn(),
    }),
  },
}));

describe('handle-status utils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('updateHeaderStatus', () => {
    it('应该使用提供的参数更新协作状态', () => {
      const mockSetCollaborationByImmer = vi.fn();
      (useCollaborationStore.getState as any).mockReturnValue({
        setCollaborationByImmer: mockSetCollaborationByImmer,
      });

      const mockProps = {
        same_with_online: true,
        committer: {
          commit_time: '2023-03-10T12:00:00Z',
          name: 'Test User',
        } as Committer,
        commit_version: 'abc123',
        branch: {
          name: 'main',
          is_protected: true,
        } as unknown as Branch,
      };

      updateHeaderStatus(mockProps);

      expect(useCollaborationStore.getState).toHaveBeenCalled();
      expect(mockSetCollaborationByImmer).toHaveBeenCalled();

      // Validate setCollaborationByImmer callback function
      const callback = mockSetCollaborationByImmer.mock.calls[0][0];
      const mockStore = {
        sameWithOnline: false,
        commit_time: '',
        committer_name: '',
        commit_version: '',
        baseVersion: '',
        branch: null,
      };

      callback(mockStore);

      expect(mockStore).toEqual({
        sameWithOnline: true,
        commit_time: '2023-03-10T12:00:00Z',
        committer_name: 'Test User',
        commit_version: 'abc123',
        baseVersion: 'abc123',
        branch: {
          name: 'main',
          is_protected: true,
        },
      });
    });

    it('应该处理部分参数缺失的情况', () => {
      const mockSetCollaborationByImmer = vi.fn();
      (useCollaborationStore.getState as any).mockReturnValue({
        setCollaborationByImmer: mockSetCollaborationByImmer,
      });

      // Only some parameters are provided
      const mockProps = {
        same_with_online: true,
      };

      updateHeaderStatus(mockProps);

      expect(useCollaborationStore.getState).toHaveBeenCalled();
      expect(mockSetCollaborationByImmer).toHaveBeenCalled();

      // Validate setCollaborationByImmer callback function
      const callback = mockSetCollaborationByImmer.mock.calls[0][0];
      const mockStore = {
        sameWithOnline: false,
        commit_time: 'old_time',
        committer_name: 'old_name',
        commit_version: 'old_version',
        baseVersion: 'old_base_version',
        branch: { name: 'old_branch' },
      };

      callback(mockStore);

      // Only sameWithOnline should be updated
      expect(mockStore).toEqual({
        sameWithOnline: true,
        commit_time: 'old_time',
        committer_name: 'old_name',
        commit_version: 'old_version',
        baseVersion: 'old_base_version',
        branch: { name: 'old_branch' },
      });
    });

    it('应该处理 committer 中的空值', () => {
      const mockSetCollaborationByImmer = vi.fn();
      (useCollaborationStore.getState as any).mockReturnValue({
        setCollaborationByImmer: mockSetCollaborationByImmer,
      });

      const mockProps = {
        committer: {
          // commit_time and name are both undefined.
        } as Committer,
      };

      updateHeaderStatus(mockProps);

      // Validate setCollaborationByImmer callback function
      const callback = mockSetCollaborationByImmer.mock.calls[0][0];
      const mockStore = {
        sameWithOnline: true,
        commit_time: 'old_time',
        committer_name: 'old_name',
      };

      callback(mockStore);

      // Should use empty string as default
      expect(mockStore).toEqual({
        sameWithOnline: false,
        commit_time: '',
        committer_name: '',
      });
    });
  });
});
