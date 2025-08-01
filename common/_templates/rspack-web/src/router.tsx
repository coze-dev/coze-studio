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

import { createBrowserRouter } from 'react-router-dom';

import { Page2 } from '@/pages/page2';
import { Page1 } from '@/pages/page1';
import App from '@/App';

export const router: ReturnType<typeof createBrowserRouter> =
  createBrowserRouter([
    {
      path: '/',
      element: <App />,
      children: [
        {
          path: 'page1',
          element: <Page1 />,
        },
        {
          path: 'page2',
          element: <Page2 />,
        },
      ],
    },
  ]);
