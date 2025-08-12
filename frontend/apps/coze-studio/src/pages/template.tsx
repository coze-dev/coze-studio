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

const TemplatePage = lazy(() =>
  import('@coze-community/explore').then(exps => ({
    default: exps.TemplatePage,
  })),
);

export const templateRouter: RouteObject = {
  path: 'template',
  Component: null,
  loader: () => ({
    hasSider: true,
    requireAuth: true,
    subMenu: null,
    menuKey: BaseEnum.Template,
  }),
  children: [
    {
      index: true,
      element: <Navigate to="list" replace />,
    },
    {
      path: 'list',
      element: <TemplatePage />,
      loader: () => ({
        type: 'template',
      }),
    },
  ],
};
