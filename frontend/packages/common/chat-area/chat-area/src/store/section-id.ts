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

import { devtools, subscribeWithSelector } from 'zustand/middleware';
import { create } from 'zustand';

interface SectionIdState {
  prevSectionId: string;
  latestSectionId: string;
}

interface SectionIdAction {
  setLatestSectionId: (id: string) => void;
  clear: () => void;
}

export const createSectionIdStore = (mark: string) =>
  create<SectionIdState & SectionIdAction>()(
    devtools(
      subscribeWithSelector((set, get) => ({
        latestSectionId: '',
        prevSectionId: '',
        setLatestSectionId: id => {
          const { latestSectionId: prevSectionId } = get();
          set(
            { latestSectionId: id, prevSectionId },
            false,
            'setLatestSectionId',
          );
        },
        clear: () => set({ latestSectionId: '' }, false, 'clear'),
      })),
      {
        name: `botStudio.ChatAreaSectionId.${mark}`,
        enabled: IS_DEV_MODE,
      },
    ),
  );

export type SectionIdStore = ReturnType<typeof createSectionIdStore>;
