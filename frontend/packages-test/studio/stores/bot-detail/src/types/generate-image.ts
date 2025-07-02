import {
  type TaskNotice,
  type PicTask,
  type GeneratePicPrompt,
} from '@coze-arch/idl/playground_api';

export enum GenerateType {
  Static = 'static',
  Gif = 'gif',
}
export enum DotStatus {
  Generating = 1,
  Success,
  Fail,
  Cancel,
  None,
}

export interface GenerateGifInfo {
  loading: boolean;
  dotStatus: DotStatus;
  text: string;
  image: PicTask;
}

export interface GenerateAvatarModal {
  visible: boolean;
  activeKey: GenerateType;
  selectedImage: PicTask;
  generatingTaskId?: string;
  gif: GenerateGifInfo;
  image: {
    loading: boolean;
    dotStatus: DotStatus;
    text: string;
    textCustomizable: boolean;
  };
}

export interface GenerateBackGroundModal {
  activeKey: GenerateType;
  selectedImage: PicTask;
  generatingTaskId?: string;
  gif: GenerateGifInfo;
  image: {
    loading: boolean;
    dotStatus: DotStatus;
    promptInfo: GeneratePicPrompt;
  };
}

// 异步生成图片的状态
export interface GenerateImageState {
  // 候选图列表信息
  imageList: PicTask[];
  // 生成图片消息信息
  noticeList: TaskNotice[];
  // 头像弹窗内生成图片的状态
  generateAvatarModal: GenerateAvatarModal;
  // 背景图弹窗内生成图片的状态
  generateBackGroundModal: GenerateBackGroundModal;
}

export interface GenerateImageAction {
  updateImageList: (list: PicTask[]) => void;
  pushImageList: (image: PicTask) => void;
  // updateImageList: (update: (state: PicTask[]) => void) => void;
  updateNoticeList: (list: TaskNotice[]) => void;
  setGenerateAvatarModal: (state: GenerateAvatarModal) => void;
  resetGenerateAvatarModal: () => void;
  setGenerateAvatarModalByImmer: (
    update: (state: GenerateAvatarModal) => void,
  ) => void;
  setGenerateBackgroundModalByImmer: (
    update: (state: GenerateBackGroundModal) => void,
  ) => void;
  clearGenerateImageStore: () => void;
}
