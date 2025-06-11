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
  /** 社区版暂不支持该功能 */
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
