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

import { RouterProvider } from 'react-router-dom';
import { Suspense } from 'react';

import { Spin } from '@coze-arch/coze-design';

import { router } from './routes';

export function App() {
  return (
    <Suspense
      fallback={
        <div className="w-full h-full flex items-center justify-center">
          <Spin spinning style={{ height: '100%', width: '100%' }} />
        </div>
      }
    >
      <RouterProvider router={router} fallbackElement={<div>loading...</div>} />
    </Suspense>
  );
}
