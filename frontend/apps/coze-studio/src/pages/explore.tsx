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

import { Navigate, type RouteObject } from 'react-router-dom';
import { lazy } from 'react';

import { BaseEnum } from '@coze-arch/web-context';

const subMenu = lazy(() =>
  import('@coze-community/explore').then(exps => ({
    default: exps.ExploreSubMenu,
  })),
);
// const TemplatePage = lazy(() =>
//   import('@coze-community/explore').then(exps => ({
//     default: exps.TemplatePage,
//   })),
// );
const PluginPage = lazy(() =>
  import('@coze-community/explore').then(exps => ({
    default: exps.PluginPage,
  })),
);

const ProjectStorePage = lazy(() =>
  import('@coze-agent-ide/agent-publish').then(exps => ({
    default: exps.TemplateStorePage,
  })),
);
export const exploreRouter: RouteObject = {
  path: 'explore',
  Component: null,
  loader: () => ({
    hasSider: true,
    requireAuth: true,
    subMenu,
    menuKey: BaseEnum.Explore,
  }),
  children: [
    {
      index: true,
      element: <Navigate to="plugin" replace />,
    },
    {
      path: 'plugin',
      element: <PluginPage />,
      loader: () => ({
        type: 'plugin',
      }),
    },
    {
      path: 'project',
      children: [
        {
          path: 'latest',
          element: <ProjectStorePage />,
          loader: () => ({
            type: 'project-latest',
            showCopyButton: false, // 显示"立即体验"而不是"复制"
          }),
        },
      ],
    },
    // {
    //   path: 'template',
    //   element: <TemplatePage />,
    //   loader: () => ({
    //     type: 'template',
    //   }),
    // },
  ],
};
