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

/* eslint-disable @coze-arch/max-line-per-function */
import { devtools } from 'zustand/middleware';
import { create } from 'zustand';
import { uniqBy, isObject } from 'lodash-es';
import { reporter } from '@coze-arch/logger';
import { CustomError } from '@coze-arch/bot-error';
import { type Creator } from '@coze-arch/bot-api/playground_api';
import {
  type ResourceIdentifier,
  ResourceType,
  PrincipalType,
} from '@coze-arch/bot-api/permission_authz';
import { type CollaboratorType } from '@coze-arch/bot-api/pat_permission_api';
import {
  PlaygroundApi,
  patPermissionApi,
  workflowApi,
  intelligenceApi,
  type BotAPIRequestConfig,
} from '@coze-arch/bot-api';

interface AuthStoreState {
  /* Two layer map
    {
      Resource Type: {
        Resource ID: Collaborator
      }
    }
  */
  collaboratorsMap: Record<ResourceType, Record<string, Creator[]>>;
}

interface AuthStoreAction {
  getCachedCollaborators: (resource: ResourceIdentifier) => Creator[];
  fetchCollaborators: (params: {
    spaceId: string;
    resource: ResourceIdentifier;
  }) => Promise<Creator[]>;
  removeCollaborators: (
    resource: ResourceIdentifier,
    userId: string,
    options?: BotAPIRequestConfig,
  ) => Promise<void>;
  batchRemoveCollaborators: (
    resource: ResourceIdentifier,
    userIds: string[],
    options?: BotAPIRequestConfig,
  ) => Promise<[string[], string[]]>;
  addCollaborator: (params: {
    resource: ResourceIdentifier;
    user: Creator;
    options?: BotAPIRequestConfig;
    roles?: Array<CollaboratorType>;
  }) => Promise<void>;
  editCollaborator: (params: {
    resource: ResourceIdentifier;
    user: Creator;
    options?: BotAPIRequestConfig;
    roles?: Array<CollaboratorType>;
  }) => Promise<void>;
  batchAddCollaborators: (params: {
    resource: ResourceIdentifier;
    users: Creator[];
    options?: BotAPIRequestConfig;
    // The third argument is the error code
    roles?: Array<CollaboratorType>;
  }) => Promise<[Creator[], Creator[], number]>;
  // New batch addition interface for permission service
  batchAddCollaboratorsServer: (params: {
    resource: ResourceIdentifier;
    users: Creator[];
    options?: BotAPIRequestConfig;
    // The third argument is the error code
    roles?: Array<CollaboratorType>;
  }) => Promise<boolean>;
}

const defaultState: AuthStoreState = {
  collaboratorsMap: Object.values(ResourceType).reduce(
    (r, val) => ({ ...r, [val]: {} }),
    {},
  ) as AuthStoreState['collaboratorsMap'],
};

export const useAuthStore = create<AuthStoreState & AuthStoreAction>()(
  // eslint-disable-next-line @coze-arch/zustand/devtools-config, max-lines-per-function
  devtools((set, get) => ({
    ...defaultState,
    getCachedCollaborators: resource =>
      get().collaboratorsMap[resource.type][resource.id],
    //
    fetchCollaborators: async ({ spaceId, resource }) => {
      switch (resource.type) {
        case ResourceType.Bot: {
          const {
            data: { creator, collaboration_list, collaborator_roles },
          } = await PlaygroundApi.DraftBotCollaboration({
            space_id: spaceId,
            bot_id: resource.id,
          });

          const res: Creator[] = [
            creator as Creator,
            ...(collaboration_list
              ? collaboration_list.map(item => ({
                  ...item,
                  roles: collaborator_roles?.[item.id as string] ?? undefined,
                }))
              : []),
          ];
          set(({ collaboratorsMap }) => ({
            collaboratorsMap: {
              ...collaboratorsMap,
              [resource.type]: {
                ...collaboratorsMap[resource.type],
                [resource.id]: res,
              },
            },
          }));
          return res;
        }
        case ResourceType.Workflow: {
          const result = await workflowApi.ListCollaborators({
            space_id: spaceId,
            workflow_id: resource.id,
          });
          const data = result.data as { owner: boolean; user: Creator }[];

          const creator = (data ?? []).find(it => it.owner === true)?.user;
          const collaborationList = (data ?? [])
            .filter(it => it?.user?.id !== creator?.id)
            .map(item => item.user);

          const res: Creator[] = [
            // @ts-expect-error -- linter-disable-autofix
            creator,
            ...(collaborationList ? collaborationList : []),
          ];

          set(({ collaboratorsMap }) => ({
            collaboratorsMap: {
              ...collaboratorsMap,
              [resource.type]: {
                ...collaboratorsMap[resource.type],
                [resource.id]: res,
              },
            },
          }));
          return res;
        }
        case ResourceType.Project: {
          const result = await intelligenceApi.ListIntelligenceCollaboration({
            intelligence_id: resource.id,
            intelligence_type: 2, // 1-Bot, 2-Project
          });
          const creator = result.data.owner_info;
          const collaborators =
            result.data.collaborator_info?.filter(
              user => user.user_id !== creator?.user_id,
            ) ?? [];
          const res: Creator[] = [creator, ...collaborators]
            .filter(user => !!user)
            .map(user => ({
              id: user?.user_id,
              name: user?.nickname,
              avatar_url: user?.avatar_url,
              user_name: user?.user_unique_name,
              user_label: user?.user_label,
            }));
          set(({ collaboratorsMap }) => ({
            collaboratorsMap: {
              ...collaboratorsMap,
              [resource.type]: {
                ...collaboratorsMap[resource.type],
                [resource.id]: res,
              },
            },
          }));
          return [];
        }
        default:
          throw new CustomError(
            '',
            'unhandled resource type calling fetchCollaborators',
          );
      }
    },
    removeCollaborators: async (resource, userId, options) => {
      await patPermissionApi.RemoveCollaborator(
        {
          resource,
          principal: {
            id: userId,
            type: PrincipalType.User,
          },
        },
        options,
      );
      set(({ collaboratorsMap, getCachedCollaborators }) => ({
        collaboratorsMap: {
          ...collaboratorsMap,
          [resource.type]: {
            ...collaboratorsMap[resource.type],
            [resource.id]: getCachedCollaborators(resource).filter(
              c => c.id !== userId,
            ),
          },
        },
      }));
    },
    // Temporarily batch processed by the front end
    batchRemoveCollaborators: async (resource, userIds, options) => {
      const resultArr = await Promise.all(
        userIds.map(
          userId =>
            new Promise<boolean>(r => {
              patPermissionApi
                .RemoveCollaborator(
                  {
                    resource,
                    principal: {
                      id: userId,
                      type: PrincipalType.User,
                    },
                  },
                  options,
                )
                .then(() => {
                  r(true);
                })
                .catch(() => {
                  r(false);
                });
            }),
        ),
      );
      const [removedUserIds, failedUserIds] = resultArr.reduce<
        [string[], string[]]
      >(
        ([r, f], success, index) => {
          const currentId = userIds[index];
          return success ? [[...r, currentId], f] : [r, [...f, currentId]];
        },
        [[], []],
      );
      set(({ collaboratorsMap, getCachedCollaborators }) => ({
        collaboratorsMap: {
          ...collaboratorsMap,
          [resource.type]: {
            ...collaboratorsMap[resource.type],
            [resource.id]: getCachedCollaborators(resource).filter(
              c => !removedUserIds.includes(c.id ?? ''),
            ),
          },
        },
      }));
      return [removedUserIds, failedUserIds];
    },
    addCollaborator: async ({ resource, user, options, roles }) => {
      await patPermissionApi.AddCollaborator(
        {
          resource,
          principal: {
            id: user.id ?? '',
            type: PrincipalType.User,
          },
          collaborator_types: roles,
        },
        options,
      );
      set(({ collaboratorsMap, getCachedCollaborators }) => ({
        collaboratorsMap: {
          ...collaboratorsMap,
          [resource.type]: {
            ...collaboratorsMap[resource.type],
            [resource.id]: uniqBy(
              [
                ...getCachedCollaborators(resource),
                {
                  ...user,
                  roles,
                },
              ],
              'id',
            ),
          },
        },
      }));
    },
    batchAddCollaborators: async ({ resource, users, options, roles }) => {
      const resultArr = await Promise.all(
        users.map(
          user =>
            new Promise<{ result: true } | { result: false; error: unknown }>(
              r => {
                patPermissionApi
                  .AddCollaborator(
                    {
                      resource,
                      principal: {
                        id: user.id ?? '',
                        type: PrincipalType.User,
                      },
                      collaborator_types: roles,
                    },
                    options,
                  )
                  .then(() => {
                    r({ result: true });
                  })
                  .catch(error => {
                    reporter.error({
                      namespace: 'collaborator',
                      error,
                      message: 'batchAddCollaborators error',
                      meta: {
                        resource,
                        principal: {
                          id: user.id ?? '',
                          type: PrincipalType.User,
                        },
                      },
                    });
                    r({ result: false, error });
                  });
              },
            ),
        ),
      );
      // Current batch implementations need to sort the code of individual added interfaces to get the highest priority message to reveal
      let errorCode = 0;
      const [addedUsers, failedUsers] = resultArr.reduce<
        [Creator[], Creator[]]
      >(
        ([r, f], finish, index) => {
          const user = users[index];
          // This is written so that ts can derive the correct type. ts@5.0.4
          if (finish.result === true) {
            return [[...r, user], f];
          }
          if (isObject(finish.error)) {
            const error = finish.error as {
              code: number | string;
              message?: string;
              msg?: string;
            };
            // Comparison code
            if (Number(error.code) > errorCode) {
              errorCode = Number(error.code);
            }
          }
          // Error, you need to compare the code and then copy the message
          return [r, [...f, user]];
        },
        [[], []],
      );
      set(({ collaboratorsMap, getCachedCollaborators }) => ({
        collaboratorsMap: {
          ...collaboratorsMap,
          [resource.type]: {
            ...collaboratorsMap[resource.type],
            [resource.id]: uniqBy(
              [
                ...getCachedCollaborators(resource),
                ...addedUsers.map(item => ({
                  ...item,
                  roles,
                })),
              ],
              'id',
            ),
          },
        },
      }));
      return [addedUsers, failedUsers, errorCode];
    },

    batchAddCollaboratorsServer: async ({
      resource,
      users,
      options,
      roles,
    }) => {
      const { code } = await patPermissionApi.BatchAddCollaborator(
        {
          principal_type: 1,
          resource,
          principal_ids: users.map(user => user.id).filter(Boolean) as string[],
        },
        options,
      );
      if (code === 0) {
        set(({ collaboratorsMap, getCachedCollaborators }) => ({
          collaboratorsMap: {
            ...collaboratorsMap,
            [resource.type]: {
              ...collaboratorsMap[resource.type],
              [resource.id]: uniqBy(
                [
                  ...getCachedCollaborators(resource),
                  ...users.map(item => ({
                    ...item,
                    roles,
                  })),
                ],
                'id',
              ),
            },
          },
        }));
      }
      return code === 0;
    },

    editCollaborator: async ({ resource, user, options, roles }) => {
      await patPermissionApi.ModifyCollaborator(
        {
          resource,
          principal: {
            id: user.id ?? '',
            type: PrincipalType.User,
          },
          collaborator_types: roles,
        },
        options,
      );
      set(({ collaboratorsMap, getCachedCollaborators }) => ({
        collaboratorsMap: {
          ...collaboratorsMap,
          [resource.type]: {
            ...collaboratorsMap[resource.type],
            [resource.id]: uniqBy(
              [
                ...getCachedCollaborators(resource).map(item => {
                  if (item.id === user.id) {
                    return {
                      ...item,
                      roles,
                    };
                  }
                  return item;
                }),
              ],
              'id',
            ),
          },
        },
      }));
    },
  })),
);
