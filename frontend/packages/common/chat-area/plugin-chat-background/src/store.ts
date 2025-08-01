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

import { devtools } from 'zustand/middleware';
import { create } from 'zustand';
import { type BackgroundImageInfo } from '@coze-arch/bot-api/developer_api';

interface BackgroundImageState {
  backgroundImageInfo: BackgroundImageInfo;
}

interface BackgroundImageAction {
  setBackgroundInfo: (backgroundImageInfo: BackgroundImageInfo) => void;
  clearBackgroundStore: () => void;
}

export const createBackgroundImageStore = (mark: string) =>
  create<BackgroundImageState & BackgroundImageAction>()(
    devtools(
      set => ({
        backgroundImageInfo: {
          mobile_background_image: {},
          web_background_image: {},
        },
        clearBackgroundStore: () =>
          set(
            {
              backgroundImageInfo: {
                mobile_background_image: {},
                web_background_image: {},
              },
            },
            false,
            'clearBackgroundStore',
          ),
        setBackgroundInfo: info => {
          set({ backgroundImageInfo: info }, false, 'setBackgroundInfo');
        },
      }),
      {
        name: `botStudio.ChatBackground.${mark}`,
        enabled: IS_DEV_MODE,
      },
    ),
  );

export type BackgroundImageStore = ReturnType<
  typeof createBackgroundImageStore
>;
