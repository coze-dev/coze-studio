import { Navigate, type RouteObject } from 'react-router-dom';
import { lazy } from 'react';

import { BaseEnum } from '@coze-arch/web-context';

const subMenu = lazy(() =>
  import('@coze-community/explore').then(exps => ({
    default: exps.ExploreSubMenu,
  })),
);
const TemplatePage = lazy(() =>
  import('@coze-community/explore').then(exps => ({
    default: exps.TemplatePage,
  })),
);
const PluginPage = lazy(() =>
  import('@coze-community/explore').then(exps => ({
    default: exps.PluginPage,
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
      path: 'template',
      element: <TemplatePage />,
      loader: () => ({
        type: 'template',
      }),
    },
  ],
};
