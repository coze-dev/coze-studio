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
