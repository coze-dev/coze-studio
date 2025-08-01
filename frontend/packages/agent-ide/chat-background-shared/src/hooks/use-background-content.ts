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

import { useShallow } from 'zustand/react/shallow';
import { useRequest } from 'ahooks';
import { GenerateType } from '@coze-studio/components';
import { useBotInfoStore } from '@coze-studio/bot-detail-store/bot-info';
import {
  DotStatus,
  useGenerateImageStore,
} from '@coze-studio/bot-detail-store';
import { PicType } from '@coze-arch/bot-api/playground_api';
import { type BackgroundImageInfo } from '@coze-arch/bot-api/developer_api';
import { PlaygroundApi } from '@coze-arch/bot-api';

export interface UseBackgroundContentProps {
  openConfig?: () => void;
  setBackgroundImageInfoList?: (value: BackgroundImageInfo[]) => void;
}

const getShowDot = (imageDotStatus: DotStatus, gifDotStatus: DotStatus) =>
  imageDotStatus !== DotStatus.None || gifDotStatus !== DotStatus.None;

const getGeneratingType = (
  imageDotStatus: DotStatus,
  gifDotStatus: DotStatus,
) =>
  imageDotStatus === DotStatus.Generating
    ? PicType.BackgroundStatic
    : gifDotStatus === DotStatus.Generating
    ? PicType.BackgroundGif
    : undefined;

export const useBackgroundContent = (props?: UseBackgroundContentProps) => {
  const { openConfig, setBackgroundImageInfoList } = props ?? {};
  const {
    messageList,
    imageDotStatus,
    gifDotStatus,
    setGenerateBackgroundModalByImmer,
  } = useGenerateImageStore(
    useShallow(state => ({
      messageList: state.imageList,
      imageDotStatus: state.generateBackGroundModal.image.dotStatus,
      gifDotStatus: state.generateBackGroundModal.gif.dotStatus,
      setGenerateBackgroundModalByImmer:
        state.setGenerateBackgroundModalByImmer,
      selectedImage: state.generateBackGroundModal.selectedImage,
    })),
  );

  const botId = useBotInfoStore(s => s.botId);
  //The latest static and dynamic graphs, unread-generating/success/failure, show the origin state
  const showDot = getShowDot(imageDotStatus, gifDotStatus);

  const hasDotType =
    imageDotStatus !== DotStatus.None
      ? PicType.BackgroundStatic
      : PicType.BackgroundGif;

  const generatingType = getGeneratingType(imageDotStatus, gifDotStatus);

  const { runAsync: markReadNotice } = useRequest(
    async () =>
      await PlaygroundApi.MarkReadNotice({
        pic_type: hasDotType,
        bot_id: botId,
      }),
    {
      manual: true,
    },
  );
  const imageReadExpression = (status: DotStatus) =>
    status !== DotStatus.None && status !== DotStatus.Generating;

  const markRead = async () => {
    if (showDot) {
      setGenerateBackgroundModalByImmer(state => {
        // Set the current tab
        state.activeKey =
          imageDotStatus !== DotStatus.None
            ? GenerateType.Static
            : GenerateType.Gif;
        // Set read status: Failure/success requires setting read, in progress/stateless, not required
        if (
          imageReadExpression(imageDotStatus) &&
          hasDotType === PicType.BackgroundStatic
        ) {
          state.image.dotStatus = DotStatus.None;
        }
        if (
          imageReadExpression(gifDotStatus) &&
          hasDotType === PicType.BackgroundGif
        ) {
          state.gif.dotStatus = DotStatus.None;
        }
      });

      if (
        imageReadExpression(imageDotStatus) ||
        imageReadExpression(gifDotStatus)
      ) {
        await markReadNotice();
      }
    }
  };

  const handleEdit = () => {
    // Open the editing pop-up window
    openConfig?.();
  };

  const handleRemove = async () => {
    // When there is an ongoing task
    if (generatingType) {
      // Cancel to continue generating
      const generatingTaskId = messageList.find(
        item => item.type === generatingType,
      )?.id;
      await PlaygroundApi.CancelGenerateGif({
        task_id: generatingTaskId,
      });
      setGenerateBackgroundModalByImmer(state => {
        if (generatingType === PicType.BackgroundGif) {
          state.gif.loading = false;
          state.gif.dotStatus = DotStatus.None;
        }
        if (generatingType === PicType.BackgroundStatic) {
          state.image.loading = false;
          state.image.dotStatus = DotStatus.None;
        }
        state.generatingTaskId = '';
      });
    }
    // A stateful tag has been read
    await markRead();
    // Clear the background cover of the current render
    setBackgroundImageInfoList?.([]);
  };

  const showDotStatus =
    imageDotStatus !== DotStatus.None ? imageDotStatus : gifDotStatus;

  return {
    handleEdit,
    showDot,
    showDotStatus,
    handleRemove,
    markRead,
  };
};
