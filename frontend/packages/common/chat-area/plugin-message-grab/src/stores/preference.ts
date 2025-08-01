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

export interface PreferenceState {
  enableGrab: boolean;
}

export interface PreferenceAction {
  updateEnableGrab: (enable: boolean) => void;
}

export const createPreferenceStore = (mark: string) => {
  const usePreferenceStore = create<PreferenceState & PreferenceAction>()(
    devtools(
      subscribeWithSelector(set => ({
        enableGrab: false,
        updateEnableGrab: enable => {
          set({
            enableGrab: enable,
          });
        },
      })),
      {
        name: `botStudio.ChatAreaGrabPlugin.Preference.${mark}`,
        enabled: IS_DEV_MODE,
      },
    ),
  );

  return usePreferenceStore;
};

export type PreferenceStore = ReturnType<typeof createPreferenceStore>;
