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

import { createBrowserRouter, Outlet } from 'react-router-dom';

import TestAppWidget from '@/dev-app/page/AppWidget';

import { TestClientDemo } from '../page/Client';
import TestChatDemo from '../page/Chat';

const Layout = () => <Outlet />;
export const devRouter: ReturnType<typeof createBrowserRouter> =
  createBrowserRouter([
    {
      path: '/',
      element: <Layout />,
      children: [
        {
          path: 'chat',
          element: <TestChatDemo />,
        },
        {
          path: 'app_widget',
          element: <TestAppWidget />,
        },
        {
          path: 'client',
          element: <TestClientDemo />,
        },
      ],
    },
  ]);
