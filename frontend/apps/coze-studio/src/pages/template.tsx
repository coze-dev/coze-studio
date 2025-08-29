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
    default: exps.TemplateSubMenu,
  })),
);

const TemplateProjectPage = lazy(() =>
  import('@coze-community/explore').then(exps => ({
    default: exps.TemplateProjectPage,
  })),
);

const FalconMarketCardDetail = lazy(() =>
  import('@coze-studio/workspace-adapter/marketCardDetail').then(exps => ({
    default: exps.FalconMarketCardDetail,
  })),
);

const TemplateCardPage = lazy(
  () => import('@coze-studio/workspace-adapter/cardTemplate'),
);

export const templateRouter: RouteObject = {
  path: 'template',
  Component: null,
  loader: () => ({
    hasSider: true,
    requireAuth: true,
    subMenu,
    menuKey: BaseEnum.Template,
  }),
  children: [
    {
      index: true,
      element: <Navigate to="project" replace />,
    },
    {
      path: 'project',
      element: <TemplateProjectPage />,
      loader: () => ({
        type: 'project',
      }),
    },
    {
      path: 'card/:sub_route_id',
      element: <TemplateCardPage />,
      loader: () => ({
        type: 'card',
      }),
    },
    {
      path: 'market-card-detail',
      element: <FalconMarketCardDetail />,
      loader: () => ({
        type: 'marketCardDetail',
      }),
    },
    {
      path: 'agent/*',
      element: <MicroAppWrapper appName="agent" />,
    },
  ],
};
