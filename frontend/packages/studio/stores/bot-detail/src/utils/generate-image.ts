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

import {
  GenPicStatus,
  PicType,
  type GetPicTaskData,
} from '@coze-arch/idl/playground_api';

import {
  type GenerateBackGroundModal,
  type GenerateAvatarModal,
  DotStatus,
  GenerateType,
} from '../types/generate-image';
import { useBotSkillStore } from '../store/bot-skill';
import getDotStatus from './get-dot-status';

export const getInitBackgroundInfo = (
  data: GetPicTaskData,
  state: GenerateBackGroundModal,
) => {
  const { tasks = [] } = data;
  const { backgroundImageInfoList = [] } = useBotSkillStore.getState();
  // Currently rendering background cover
  const uri =
    backgroundImageInfoList[0]?.mobile_background_image?.origin_image_uri;

  const backgroundGifList = tasks.filter(
    item => item.type && [PicType.BackgroundGif].includes(item.type),
  );
  const backgroundStaticList = tasks.filter(
    item => item.type && [PicType.BackgroundStatic].includes(item.type),
  );
  const imageDotStatus = getDotStatus(
    data,
    PicType.BackgroundStatic,
  ) as DotStatus;
  const gifDotStatus = getDotStatus(data, PicType.BackgroundGif) as DotStatus;

  // Graph related state
  state.gif.loading = backgroundGifList.some(
    item => item.status === GenPicStatus.Generating,
  );
  state.gif.text =
    backgroundGifList.find(item => item?.img_info?.prompt)?.img_info?.prompt
      ?.ori_prompt ?? '';

  state.gif.dotStatus = gifDotStatus;
  const image = backgroundGifList.find(item => item.img_info?.ori_url);
  // first frame information
  if (image) {
    state.gif.image = {
      img_info: {
        tar_uri: image.img_info?.ori_uri,
        tar_url: image.img_info?.ori_url,
      },
    };
  }

  // Static graph correlation state
  state.image.loading = backgroundStaticList.some(
    item => item.status === GenPicStatus.Generating,
  );
  state.image.dotStatus = imageDotStatus;
  state.image.promptInfo =
    backgroundStaticList.find(item => item?.img_info?.prompt?.ori_prompt)
      ?.img_info?.prompt ?? {};

  const lastImageTask =
    tasks.find(item => item.type === PicType.BackgroundStatic) ?? {};
  const lastGifTask =
    tasks.find(item => item.type === PicType.BackgroundGif) ?? {};
  // Currently selected image: generate a successful display, the successful image, otherwise find the same background cover
  if (gifDotStatus === DotStatus.Success) {
    state.selectedImage = lastGifTask;
  } else if (imageDotStatus === DotStatus.Success) {
    state.selectedImage = lastImageTask;
  } else {
    // Uploaded manually, can't find it.
    state.selectedImage =
      tasks.find(item => item.img_info?.tar_uri === uri) ?? {};
  }
  // Current tab: only if, only gif when the state is not done, in the gif tab
  if (gifDotStatus !== DotStatus.None) {
    state.activeKey = GenerateType.Gif;
  }
  // The taskId currently being generated
  if (
    gifDotStatus === DotStatus.Generating ||
    imageDotStatus === DotStatus.Generating
  ) {
    state.generatingTaskId =
      gifDotStatus === DotStatus.Generating
        ? lastGifTask?.id
        : lastImageTask?.id;
  }
};

export const getInitAvatarInfo = (
  data: GetPicTaskData,
  state: GenerateAvatarModal,
) => {
  const { tasks = [] } = data || {};
  const lastImageTask = tasks.find(
    item => item.type === PicType.IconStatic,
  ) || {
    id: '',
    img_info: {},
  };
  const lastGifTask = tasks.find(item => item.type === PicType.IconGif) || {
    id: '',
    img_info: {},
  };
  const gifDotStatus = getDotStatus(data, PicType.IconGif) as DotStatus;
  const imageDotStatus = getDotStatus(data, PicType.IconStatic) as DotStatus;
  if (
    gifDotStatus === DotStatus.Success ||
    imageDotStatus === DotStatus.Success
  ) {
    state.selectedImage =
      gifDotStatus === DotStatus.Success ? lastGifTask : lastImageTask;
  }

  if (
    gifDotStatus === DotStatus.Generating ||
    imageDotStatus === DotStatus.Generating
  ) {
    state.generatingTaskId =
      gifDotStatus === DotStatus.Generating
        ? lastGifTask?.id
        : lastImageTask?.id;
  }
  state.gif = {
    dotStatus: gifDotStatus,
    text: lastGifTask?.img_info?.prompt?.ori_prompt ?? '',
    loading: gifDotStatus === DotStatus.Generating,
    image: {
      id: lastGifTask.img_info?.ori_uri ?? '',
      img_info: {
        tar_uri: lastGifTask.img_info?.ori_uri ?? '',
        tar_url: lastGifTask.img_info?.ori_url ?? '',
      },
    },
  };
  state.image = {
    dotStatus: imageDotStatus,
    text: lastImageTask.img_info?.prompt?.ori_prompt ?? '',
    loading: imageDotStatus === DotStatus.Generating,
    textCustomizable: Boolean(lastImageTask.img_info?.prompt?.ori_prompt),
  };
};
