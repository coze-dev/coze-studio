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
import { MicroAppWrapper } from '../apps/MicroAppWrapper'

const subMenu = lazy(() =>
  import('@coze-community/explore').then(exps => ({
    default: exps.ExploreSubMenu,
  })),
);
const ProjectPage = lazy(() =>
  import('@coze-community/explore').then(exps => ({
    default: exps.ProjectPage,
  })),
);
const ExternalAppPage = lazy(() =>
  import('@coze-community/explore').then(exps => ({
    default: exps.ExternalAppPage,
  })),
);
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
      element: <Navigate to="project/latest" replace />,
    },
    {
      path: 'project/tools',
      element: <ExternalAppPage />,
      loader: () => ({
        type: 'project-tools',
      }),
    },
    {
      path: 'plugin',
      element: <PluginPage />,
      loader: () => ({
        type: 'plugin',
      }),
    },
    {
      path: 'project/:sub_route_id',
      element: <ProjectPage />,
      loader: () => ({
        type: 'project',
      }),
    },
    {
      path: 'agent/*',
      element: <MicroAppWrapper appName="agent" />,
    },
  ],
};
