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
import { lazy } from 'react';

import { SpaceSubModuleEnum } from '@coze-foundation/space-ui-adapter';
import { GlobalError } from '@coze-foundation/layout';
import { BaseEnum } from '@coze-arch/web-context';

import { exploreRouter } from './pages/explore';
import { templateRouter } from './pages/template';
import { Layout } from './layout';
const subMenu = lazy(() =>
  import('@coze-foundation/space-ui-adapter').then(exps => ({
    default: exps.WorkspaceSubMenu,
  })),
);

const SpaceLayout = lazy(() =>
  import('@coze-foundation/space-ui-adapter').then(exps => ({
    default: exps.SpaceLayout,
  })),
);

const SpaceIdLayout = lazy(() =>
  import('@coze-foundation/space-ui-base').then(exps => ({
    default: exps.SpaceIdLayout,
  })),
);

const KnowledgePreview = lazy(() =>
  import('@coze-studio/workspace-base/knowledge-preview').then(exps => ({
    default: exps.KnowledgePreviewPage,
  })),
);

const KnowledgeUpload = lazy(() =>
  import('@coze-studio/workspace-base/knowledge-upload').then(exps => ({
    default: exps.KnowledgeUploadPage,
  })),
);

const DatabaseDetail = lazy(() =>
  import('@coze-studio/workspace-base').then(exps => ({
    default: exps.DatabaseDetailPage,
  })),
);

const AgentIDELayout = lazy(() => import('@coze-agent-ide/layout-adapter'));

const AgentIDE = lazy(() =>
  import('@coze-agent-ide/entry-adapter').then(res => ({
    default: res.BotEditor,
  })),
);

const IDELayout = lazy(() =>
  import('@coze-project-ide/main').then(exps => ({
    default: exps.IDELayout,
  })),
);

const IDEPublish = lazy(() =>
  import('@coze-studio/project-publish').then(exps => ({
    default: exps.ProjectPublish,
  })),
);

const Develop = lazy(() => import('./pages/develop'));
const Library = lazy(() => import('./pages/library'));
const Members = lazy(() => import('./pages/members'));

const WorkflowPage = lazy(() =>
  import('@coze-workflow/playground-adapter').then(res => ({
    default: res.WorkflowPage,
  })),
);

const PluginPageLayout = lazy(() => import('./pages/plugin/layout'));
const PluginPage = lazy(() => import('./pages/plugin/page'));
const PluginToolPage = lazy(() => import('./pages/plugin/tool/page'));
const PluginMocksetPage = lazy(
  () => import('./pages/plugin/tool/plugin-mock-set/page'),
);
const PluginMocksetDetailPage = lazy(
  () => import('./pages/plugin/tool/plugin-mock-set/detail/page'),
);

const LoginPage = lazy(() =>
  import('@coze-foundation/account-ui-adapter').then(res => ({
    default: res.LoginPage,
  })),
);

const AgentPublishPage = lazy(() =>
  import('@coze-agent-ide/agent-publish').then(exps => ({
    default: exps.AgentPublishPage,
  })),
);

const DocsRedirect = lazy(() => import('./pages/docs'));

const SpaceModelConfig = lazy(() => import('./pages/space-model-config'));

export const router: ReturnType<typeof createBrowserRouter> =
  createBrowserRouter([
    {
      path: '/open/docs/*',
      Component: DocsRedirect,
      loader: () => ({
        hasSider: false,
        requireAuth: false,
      }),
    },
    {
      path: '/docs/*',
      Component: DocsRedirect,
      loader: () => ({
        hasSider: false,
        requireAuth: false,
      }),
    },
    {
      path: '/',
      Component: Layout,
      errorElement: <GlobalError />,
      children: [
        {
          index: true,
          element: <Navigate to="/space" replace />,
        },
        exploreRouter,
        templateRouter,
        {
          path: 'sign',
          Component: LoginPage,
          errorElement: <GlobalError />,
          loader: () => ({
            hasSider: false,
            requireAuth: false,
          }),
        },
        {
          path: 'space',
          Component: SpaceLayout,
          loader: () => ({
            hasSider: true,
            requireAuth: true,
            subMenu,
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
                {
                  path: 'develop',
                  Component: Develop,
                  loader: () => ({
                    subMenuKey: SpaceSubModuleEnum.DEVELOP,
                  }),
                },
                {
                  path: 'project-ide/:project_id/publish',
                  loader: () => ({
                    hasSider: false,
                  }),
                  Component: IDEPublish,
                },
                {
                  path: 'project-ide/:project_id/*',
                  Component: IDELayout,
                  loader: () => ({
                    hasSider: false,
                  }),
                },
                {
                  path: 'library/:source_type',
                  Component: Library,
                  loader: request => ({
                    subMenuKey: `${SpaceSubModuleEnum.LIBRARY}/${
                      request.params.source_type
                    }`,
                  }),
                },
                {
                  path: 'members',
                  Component: Members,
                  loader: () => ({
                    subMenuKey: SpaceSubModuleEnum.MEMBERS,
                  }),
                },
                {
                  path: 'models',
                  Component: SpaceModelConfig,
                  loader: () => ({
                    subMenuKey: SpaceSubModuleEnum.MODELS,
                  }),
                },
                {
                  path: 'project-ide/:project_id/*',
                  Component: IDELayout,
                  loader: () => ({
                    hasSider: false,
                  }),
                },
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
                {
                  path: 'plugin/:plugin_id',
                  Component: PluginPageLayout,
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
                        {
                          path: 'plugin-mock-set',
                          Component: PluginMocksetPage,
                          children: [
                            {
                              path: ':mock_set_id',
                              children: [
                                {
                                  index: true,
                                  Component: PluginMocksetDetailPage,
                                },
                              ],
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          path: 'work_flow',
          Component: WorkflowPage,
          loader: () => ({
            hasSider: false,
            requireAuth: true,
          }),
        },
      ],
    },
  ]);
