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
 
import { createBrowserRouter, Navigate } from 'react-router-dom';

import { SpaceSubModuleEnum } from '@coze-foundation/space-ui-adapter';
import { GlobalError } from '@coze-foundation/layout';
import { BaseEnum } from '@coze-arch/web-context';

import { Layout } from '../layout';
import {
  LoginPage,
  SpaceLayout,
  SpaceIdLayout,
  Develop,
  AgentIDELayout,
  AgentIDE,
  AgentPublishPage,
  Redirect,
  spaceSubMenu,
  exploreSubMenu,
  WorkflowPage,
  ProjectIDE,
  ProjectIDEPublish,
  Library,
  PluginLayout,
  PluginToolPage,
  PluginPage,
  KnowledgePreview,
  KnowledgeUpload,
  DatabaseDetail,
  ExplorePluginPage,
  ExploreTemplatePage,
} from './async-components';

export const router: ReturnType<typeof createBrowserRouter> =
  createBrowserRouter([
    // 文档路由
    {
      path: '/open/docs/*',
      Component: Redirect,
      loader: () => ({
        hasSider: false,
        requireAuth: false,
      }),
    },
    {
      path: '/docs/*',
      Component: Redirect,
      loader: () => ({
        hasSider: false,
        requireAuth: false,
      }),
    },
    {
      path: '/information/auth/success',
      Component: Redirect,
      loader: () => ({
        hasSider: false,
        requireAuth: false,
      }),
    },
    // 主应用路由
    {
      path: '/',
      Component: Layout,
      errorElement: <GlobalError />,
      children: [
        {
          index: true,
          element: <Navigate to="/space" replace />,
        },
        // 登录页路由
        {
          path: 'sign',
          Component: LoginPage,
          errorElement: <GlobalError />,
          loader: () => ({
            hasSider: false,
            requireAuth: false,
          }),
        },

        // 工作空间路由
        {
          path: 'space',
          Component: SpaceLayout,
          loader: () => ({
            hasSider: true,
            requireAuth: true,
            subMenu: spaceSubMenu,
            menuKey: BaseEnum.Space,
          }),
          children: [
            {
              path: ':space_id',
              Component: SpaceIdLayout,
              children: [
                {
                  index: true,
                  element: <Navigate to="develop" replace />,
                },

                // 项目开发
                {
                  path: 'develop',
                  Component: Develop,
                  loader: () => ({
                    subMenuKey: SpaceSubModuleEnum.DEVELOP,
                  }),
                },

                // Agent IDE
                {
                  path: 'bot/:bot_id',
                  Component: AgentIDELayout,
                  children: [
                    {
                      index: true,
                      Component: AgentIDE,
                    },
                    {
                      path: 'publish',
                      children: [
                        {
                          index: true,
                          Component: AgentPublishPage,
                          loader: () => ({
                            hasSider: false,
                            requireBotEditorInit: false,
                            pageName: 'publish',
                          }),
                        },
                      ],
                    },
                  ],
                  loader: () => ({
                    hasSider: false,
                    showMobileTips: true,
                    requireBotEditorInit: true,
                    pageName: 'bot',
                  }),
                },

                // Project IDE
                {
                  path: 'project-ide/:project_id/publish',
                  loader: () => ({
                    hasSider: false,
                  }),
                  Component: ProjectIDEPublish,
                },
                {
                  path: 'project-ide/:project_id/*',
                  Component: ProjectIDE,
                  loader: () => ({
                    hasSider: false,
                  }),
                },

                // 资源库
                {
                  path: 'library',
                  Component: Library,
                  loader: () => ({
                    subMenuKey: SpaceSubModuleEnum.LIBRARY,
                  }),
                },

                // 知识库资源
                {
                  path: 'knowledge',
                  children: [
                    {
                      path: ':dataset_id',
                      element: <KnowledgePreview />,
                    },
                    {
                      path: ':dataset_id/upload',
                      element: <KnowledgeUpload />,
                    },
                  ],
                  loader: () => ({
                    pageModeByQuery: true,
                  }),
                },

                // 数据库资源
                {
                  path: 'database',
                  children: [
                    {
                      path: ':table_id',
                      element: <DatabaseDetail />,
                    },
                  ],
                  loader: () => ({
                    showMobileTips: true,
                    pageModeByQuery: true,
                  }),
                },

                // 插件资源
                {
                  path: 'plugin/:plugin_id',
                  Component: PluginLayout,
                  children: [
                    {
                      index: true,
                      Component: PluginPage,
                    },
                    {
                      path: 'tool/:tool_id',
                      children: [
                        {
                          index: true,
                          Component: PluginToolPage,
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },

        // 工作流路由
        {
          path: 'work_flow',
          Component: WorkflowPage,
          loader: () => ({
            hasSider: false,
            requireAuth: true,
          }),
        },

        // 探索
        {
          path: 'explore',
          Component: null,
          loader: () => ({
            hasSider: true,
            requireAuth: true,
            subMenu: exploreSubMenu,
            menuKey: BaseEnum.Explore,
          }),
          children: [
            {
              index: true,
              element: <Navigate to="plugin" replace />,
            },
            // 插件商店
            {
              path: 'plugin',
              element: <ExplorePluginPage />,
              loader: () => ({
                type: 'plugin',
              }),
            },
            // 模版
            {
              path: 'template',
              element: <ExploreTemplatePage />,
              loader: () => ({
                type: 'template',
              }),
            },
          ],
        },
      ],
    },
  ]);
