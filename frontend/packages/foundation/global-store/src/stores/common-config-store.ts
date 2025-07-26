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
import {
  type CozeBanner,
  type HomeBannerDisplay,
  type QuickStartConfig,
} from '@coze-arch/bot-api/playground_api';

interface ICommonConfig {
  botIdeGuideVideoUrl: string;
  bannerConfig?: CozeBanner;
  homeBannerTask?: Array<HomeBannerDisplay>;
  quickStart?: Array<QuickStartConfig>;
  oceanProjectSpaces?: Array<string>;
  douyinAvatarSpaces?: Array<string>;
}
export interface ICommonConfigStoreState {
  initialized: boolean;
  commonConfigs: ICommonConfig;
}

export interface ICommonConfigStoreAction {
  setInitialized: () => void;
  updateCommonConfigs: (commonConfigs: ICommonConfig) => void;
}

const DEFAULT_COMMON_CONFIG_STATE: ICommonConfigStoreState = {
  commonConfigs: {
    botIdeGuideVideoUrl: '',
    homeBannerTask: [],
    quickStart: [],
    oceanProjectSpaces: [],
    douyinAvatarSpaces: [],
  },
  initialized: false,
};

export const useCommonConfigStore = create<
  ICommonConfigStoreState & ICommonConfigStoreAction
>()(
  devtools(set => ({
    ...DEFAULT_COMMON_CONFIG_STATE,
    updateCommonConfigs(commonConfigs: ICommonConfig) {
      set(state => ({ ...state, commonConfigs }));
    },
    setInitialized: () => {
      set({
        initialized: true,
      });
    },
  })),
);
