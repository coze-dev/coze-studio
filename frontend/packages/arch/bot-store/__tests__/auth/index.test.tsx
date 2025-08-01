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
import { renderHook, act } from '@testing-library/react';
import { ResourceType } from '@coze-arch/bot-api/permission_authz';
import {
  PlaygroundApi,
  patPermissionApi,
  workflowApi,
  intelligenceApi,
} from '@coze-arch/bot-api';

import { useAuthStore } from '../../src/auth';

// simulated global variable
vi.stubGlobal('IS_DEV_MODE', false);

// simulated dependency
vi.mock('@coze-arch/bot-api', () => ({
  PlaygroundApi: {
    DraftBotCollaboration: vi.fn().mockResolvedValue({
      data: {
        creator: { id: 'creator-id', name: 'Creator' },
        collaboration_list: [{ id: 'collab-id', name: 'Collaborator' }],
        collaborator_roles: { 'collab-id': ['editor'] },
      },
    }),
    GetCollaborators: vi.fn(),
  },
  patPermissionApi: {
    AddCollaborator: vi.fn().mockResolvedValue({ code: 0 }),
    RemoveCollaborator: vi.fn().mockResolvedValue({ code: 0 }),
    BatchAddCollaborator: vi.fn().mockResolvedValue({ code: 0 }),
  },
  workflowApi: {
    ListCollaborators: vi.fn().mockResolvedValue({
      data: [
        { owner: true, user: { id: 'creator-id', name: 'Creator' } },
        { owner: false, user: { id: 'collab-id', name: 'Collaborator' } },
      ],
    }),
    GetWorkflowCollaborators: vi.fn(),
    AddWorkflowCollaborator: vi.fn(),
  },
  intelligenceApi: {
    ListCollaborators: vi.fn().mockResolvedValue({
      data: [
        { owner: true, user: { id: 'creator-id', name: 'Creator' } },
        { owner: false, user: { id: 'collab-id', name: 'Collaborator' } },
      ],
    }),
    GetIntelligenceCollaborators: vi.fn(),
  },
  ResourceType: {
    Bot: 'Bot',
    Workflow: 'Workflow',
    Intelligence: 'Intelligence',
  } as any,
  PrincipalType: {
    User: 1,
  },
}));

// Analog logger
vi.mock('@coze-arch/logger', () => ({
  reporter: {
    error: vi.fn(),
  },
  logger: {
    createLoggerWith: vi.fn(),
  },
}));

// Simulate CustomError
vi.mock('@coze-arch/bot-error', () => ({
  CustomError: vi.fn(),
}));

describe('auth', () => {
  const mockSpaceId = 'test-space-id';
  const mockBotId = 'test-bot-id';
  const mockWorkflowId = 'test-workflow-id';
  const mockIntelligenceId = 'test-intelligence-id';

  const mockCreator = {
    user_id: 'test-user-id',
    name: 'Test User',
    avatar: 'test-avatar-url',
  };

  const mockCreators = [mockCreator];

  beforeEach(() => {
    vi.clearAllMocks();

    // Reset store state
    act(() => {
      useAuthStore.setState({
        collaboratorsMap: {
          [ResourceType.Bot]: {},
          [ResourceType.Workflow]: {},
          [ResourceType.Intelligence]: {},
        } as any,
        // Ensure getCachedCollaborators method returns an empty array
        getCachedCollaborators: vi.fn().mockReturnValue([]),
      });
    });

    // Simulate API response
    (PlaygroundApi.DraftBotCollaboration as any).mockResolvedValue({
      data: mockCreators,
    });

    (workflowApi.ListCollaborators as any).mockResolvedValue({
      data: mockCreators,
    });

    (intelligenceApi.ListCollaborators as any).mockResolvedValue({
      data: mockCreators,
    });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('useAuthStore', () => {
    it('应该初始化为空的协作者映射', () => {
      const { result } = renderHook(() => useAuthStore());

      expect(result.current.collaboratorsMap).toBeDefined();
    });

    describe('getCachedCollaborators', () => {
      it('当缓存中有协作者时应该返回缓存的协作者', () => {
        const { result } = renderHook(() => useAuthStore());

        // Set up the cache first
        act(() => {
          useAuthStore.setState({
            collaboratorsMap: {
              [ResourceType.Bot]: {
                [mockBotId]: mockCreators,
              },
              [ResourceType.Workflow]: {},
              [ResourceType.Intelligence]: {},
            } as any,
            getCachedCollaborators: vi
              .fn()
              .mockImplementation(({ type, id }) => {
                if (type === ResourceType.Bot && id === mockBotId) {
                  return mockCreators;
                }
                return [];
              }),
          });
        });

        const cachedCollaborators = result.current.getCachedCollaborators({
          type: ResourceType.Bot,
          id: mockBotId,
        });

        expect(cachedCollaborators).toEqual(mockCreators);
      });

      it('当缓存中没有协作者时应该返回空数组', () => {
        const { result } = renderHook(() => useAuthStore());

        const cachedCollaborators = result.current.getCachedCollaborators({
          type: ResourceType.Bot,
          id: mockBotId,
        });

        expect(cachedCollaborators).toEqual([]);
      });
    });

    describe('fetchCollaborators', () => {
      it('当资源类型为 Bot 时应该调用 PlaygroundApi.DraftBotCollaboration', async () => {
        const { result } = renderHook(() => useAuthStore());

        await act(async () => {
          await result.current.fetchCollaborators({
            spaceId: mockSpaceId,
            resource: {
              type: ResourceType.Bot,
              id: mockBotId,
            },
          });
        });

        expect(PlaygroundApi.DraftBotCollaboration).toHaveBeenCalledWith({
          space_id: mockSpaceId,
          bot_id: mockBotId,
        });
      });

      it('当资源类型为 Workflow 时应该调用 workflowApi.ListCollaborators', async () => {
        const { result } = renderHook(() => useAuthStore());

        await act(async () => {
          await result.current.fetchCollaborators({
            spaceId: mockSpaceId,
            resource: {
              type: ResourceType.Workflow,
              id: mockWorkflowId,
            },
          });
        });

        expect(workflowApi.ListCollaborators).toHaveBeenCalledWith({
          space_id: mockSpaceId,
          workflow_id: mockWorkflowId,
        });
      });

      it('当资源类型为 Intelligence 时应该调用 intelligenceApi.ListCollaborators', async () => {
        const { result } = renderHook(() => useAuthStore());

        await act(async () => {
          await result.current.fetchCollaborators({
            spaceId: mockSpaceId,
            resource: {
              type: ResourceType.Workflow as any,
              id: mockIntelligenceId,
            },
          });
        });

        expect(workflowApi.ListCollaborators as any).toHaveBeenCalledWith({
          space_id: mockSpaceId,
          workflow_id: mockIntelligenceId,
        });
      });

      it('当资源类型不支持时应该抛出错误', async () => {
        const { result } = renderHook(() => useAuthStore());

        await expect(
          result.current.fetchCollaborators({
            spaceId: mockSpaceId,
            resource: {
              type: 'UnsupportedType' as any,
              id: 'test-id',
            },
          }),
        ).rejects.toThrow();
      });
    });

    describe('addCollaborator', () => {
      it('当资源类型为 Bot 时应该调用 patPermissionApi.AddCollaborator', async () => {
        const { result } = renderHook(() => useAuthStore());

        // Make sure getCachedCollaborators return an empty array
        vi.spyOn(result.current, 'getCachedCollaborators').mockReturnValue([]);

        (patPermissionApi.AddCollaborator as any).mockResolvedValue({});

        await act(async () => {
          await result.current.addCollaborator({
            resource: {
              type: ResourceType.Bot,
              id: mockBotId,
            },
            user: mockCreator,
            roles: ['editor'] as any,
          });
        });

        console.log(patPermissionApi.AddCollaborator.mock.calls[0][0]);
        expect(patPermissionApi.AddCollaborator.mock.calls[0][0]).toMatchObject(
          {
            resource: { type: 4, id: 'test-bot-id' },
            principal: { id: '', type: 1 },
            collaborator_types: ['editor'],
          },
        );
      });

      it('当资源类型为 Workflow 时应该调用 workflowApi.AddWorkflowCollaborator', async () => {
        const { result } = renderHook(() => useAuthStore());

        (workflowApi.AddWorkflowCollaborator as any).mockResolvedValue({});
        patPermissionApi.AddCollaborator.mockResolvedValue({});

        await act(async () => {
          await result.current.addCollaborator({
            resource: {
              type: ResourceType.Workflow,
              id: mockWorkflowId,
            },
            user: mockCreator,
            roles: ['editor'] as any,
          });
        });

        expect(patPermissionApi.AddCollaborator as any).toHaveBeenCalledWith(
          {
            resource: { type: ResourceType.Workflow, id: 'test-workflow-id' },
            principal: { id: '', type: 1 },
            collaborator_types: ['editor'],
          },
          undefined,
        );
      });
    });

    describe('removeCollaborators', () => {
      it('当资源类型为 Bot 时应该调用 patPermissionApi.RemoveCollaborator', async () => {
        const { result } = renderHook(() => useAuthStore());

        (patPermissionApi.RemoveCollaborator as any).mockResolvedValue({});

        await act(async () => {
          await result.current.removeCollaborators(
            {
              type: ResourceType.Bot,
              id: mockBotId,
            },
            mockCreator.user_id,
          );
        });

        expect(patPermissionApi.RemoveCollaborator).toHaveBeenCalledWith(
          {
            resource: { type: 4, id: 'test-bot-id' },
            principal: { id: 'test-user-id', type: 1 },
          },
          undefined,
        );
      });
    });

    describe('batchRemoveCollaborators', () => {
      it('应该调用 patPermissionApi.RemoveCollaborator', async () => {
        const { result } = renderHook(() => useAuthStore());

        const mockUserIds = ['user1', 'user2'];
        const mockSuccessIds = ['user1'];
        const mockFailedIds = ['user2'];

        (patPermissionApi.RemoveCollaborator as any).mockResolvedValueOnce({});
        (patPermissionApi.RemoveCollaborator as any).mockRejectedValueOnce({});

        await act(async () => {
          const [successIds, failedIds] =
            await result.current.batchRemoveCollaborators(
              {
                type: ResourceType.Bot,
                id: mockBotId,
              },
              mockUserIds,
            );

          expect(successIds).toEqual(mockSuccessIds);
          expect(failedIds).toEqual(mockFailedIds);
        });

        expect(patPermissionApi.RemoveCollaborator).toHaveBeenCalledTimes(2);
      });
    });

    describe('batchAddCollaborators', () => {
      it('当资源类型为 Bot 时应该调用 patPermissionApi.AddCollaborator', async () => {
        const { result } = renderHook(() => useAuthStore());

        // Make sure getCachedCollaborators return an empty array
        vi.spyOn(result.current, 'getCachedCollaborators').mockReturnValue([]);

        const mockUsers = [
          mockCreator,
          {
            user_id: 'test-user-id2',
            name: 'Test User2',
            avatar: 'test-avatar-url2',
          },
        ];
        const mockSuccessUsers = mockUsers;
        const mockFailedUsers: any[] = [];

        (patPermissionApi.AddCollaborator as any).mockResolvedValue({
          data: {
            success_users: mockSuccessUsers,
            failed_users: mockFailedUsers,
          },
        });

        await act(async () => {
          const [successUsers, failedUsers, errorCode] =
            await result.current.batchAddCollaborators({
              resource: {
                type: ResourceType.Bot,
                id: mockBotId,
              },
              users: mockUsers,
              roles: ['editor'] as any,
            });

          expect(successUsers).toEqual(mockSuccessUsers);
          expect(failedUsers).toEqual(mockFailedUsers);
          expect(errorCode).toBe(0);
        });

        expect(patPermissionApi.AddCollaborator).toHaveBeenCalledTimes(2);
      });
    });

    describe('batchAddCollaboratorsServer', () => {
      it('应该调用 patPermissionApi.BatchAddCollaborator', async () => {
        const { result } = renderHook(() => useAuthStore());

        (patPermissionApi.BatchAddCollaborator as any).mockResolvedValue({
          code: 0,
          data: {
            success: true,
          },
        });

        await act(async () => {
          const success = await result.current.batchAddCollaboratorsServer({
            resource: {
              type: ResourceType.Bot,
              id: mockBotId,
            },
            users: [{ id: 'test-user-id' }],
            roles: ['editor'] as any,
          });

          expect(success).toBe(true);
        });

        expect(patPermissionApi.BatchAddCollaborator).toHaveBeenCalledWith(
          {
            principal_ids: ['test-user-id'],
            principal_type: 1,
            resource: { type: 4, id: 'test-bot-id' },
          },
          undefined,
        );
      });
    });
  });
});
