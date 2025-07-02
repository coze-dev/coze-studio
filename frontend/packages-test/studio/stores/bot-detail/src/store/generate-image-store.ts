import { devtools, subscribeWithSelector } from 'zustand/middleware';
import { create } from 'zustand';
import { produce } from 'immer';
import { type TaskNotice, type PicTask } from '@coze-arch/idl/playground_api';

import {
  type GenerateImageState,
  type GenerateImageAction,
  type GenerateAvatarModal,
  GenerateType,
  DotStatus,
  type GenerateBackGroundModal,
} from '../types/generate-image';

export const DEFAULT_BOT_GENERATE_AVATAR_MODAL = (): GenerateAvatarModal => ({
  visible: false,
  activeKey: GenerateType.Static,
  selectedImage: { id: '', img_info: {} },
  gif: {
    loading: false,
    dotStatus: DotStatus.None,
    text: '',
    image: { id: '', img_info: {} },
  },
  image: {
    loading: false,
    dotStatus: DotStatus.None,
    text: '',
    textCustomizable: false,
  },
});

export const DEFAULT_BOT_GENERATE_BACKGROUND_MODAL =
  (): GenerateBackGroundModal => ({
    activeKey: GenerateType.Static,
    selectedImage: { id: '', img_info: {} },
    gif: {
      loading: false,
      dotStatus: DotStatus.None,
      text: '',
      image: { id: '', img_info: {} },
    },
    image: {
      loading: false,
      dotStatus: DotStatus.None,
      promptInfo: {},
    },
  });

export const useGenerateImageStore = create<
  GenerateImageState & GenerateImageAction
>()(
  devtools(
    subscribeWithSelector(set => ({
      imageList: [],
      noticeList: [],
      generateAvatarModal: DEFAULT_BOT_GENERATE_AVATAR_MODAL(),
      generateBackGroundModal: DEFAULT_BOT_GENERATE_BACKGROUND_MODAL(),
      clearGenerateImageStore: () => {
        set({
          imageList: [],
          noticeList: [],
          generateAvatarModal: DEFAULT_BOT_GENERATE_AVATAR_MODAL(),
          generateBackGroundModal: DEFAULT_BOT_GENERATE_BACKGROUND_MODAL(),
        });
      },
      updateImageList: (imageList: PicTask[]) => {
        set(s => ({
          ...s,
          imageList,
        }));
      },
      pushImageList: (image: PicTask) => {
        set(s => ({
          ...s,
          imageList: [...s.imageList, image],
        }));
      },
      updateNoticeList: (notices: TaskNotice[]) => {
        set(s => ({ ...s, notices }));
      },
      setGenerateAvatarModal: generateAvatarModal => {
        set({ generateAvatarModal });
      },
      resetGenerateAvatarModal: () => {
        set({ generateAvatarModal: DEFAULT_BOT_GENERATE_AVATAR_MODAL() });
      },
      setGenerateAvatarModalByImmer: update =>
        set(
          produce<GenerateImageState>(({ generateAvatarModal }) =>
            update(generateAvatarModal),
          ),
        ),
      setGenerateBackgroundModalByImmer: update =>
        set(
          produce<GenerateImageState>(({ generateBackGroundModal }) =>
            update(generateBackGroundModal),
          ),
        ),
    })),

    {
      enabled: IS_DEV_MODE,
      name: 'botStudio.botDetail.botGenerateImage',
    },
  ),
);
