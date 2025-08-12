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

import { persist, devtools } from 'zustand/middleware';
import { create } from 'zustand';

interface ResizableSidePanelStoreState {
  width: number;
}

interface ResizableSidePanelStoreActions {
  setWidth: (width: number) => void;
}

type ResizableSidePanelStore = ResizableSidePanelStoreState &
  ResizableSidePanelStoreActions;

const NAME = 'workflow-resizable-side-panel';

/**
 * Adjustable width side window state, requires persistence
 */
export const useResizableSidePanelStore = create<ResizableSidePanelStore>()(
  devtools(
    persist(
      set => ({
        width: 0,
        setWidth: width => set({ width }),
      }),
      {
        name: NAME,
      },
    ),
    {
      enabled: IS_DEV_MODE,
      name: NAME,
    },
  ),
);
