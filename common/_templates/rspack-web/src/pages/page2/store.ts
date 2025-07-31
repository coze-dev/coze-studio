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

import { immer } from 'zustand/middleware/immer';
import { devtools } from 'zustand/middleware';
import { create } from 'zustand';

interface Page1State {
  count: number;
  updateCount: () => void;
}

// only for page2
export const usePage2Store = create<Page1State>()(
  devtools(
    immer(set => ({
      count: 1,
      updateCount: () => {
        set(it => {
          it.count++;
        });
      },
    })),
    {
      enabled: IS_DEV_MODE,
      name: 'api-builder/page2',
    },
  ),
);
