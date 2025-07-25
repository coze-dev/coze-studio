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
  //最新的 静图与动图 未读 - 生成中/成功/失败，展示原点状态
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
        // 设置当前tab
        state.activeKey =
          imageDotStatus !== DotStatus.None
            ? GenerateType.Static
            : GenerateType.Gif;
        // 设置已读状态：失败/成功需要设置已读，进行中/无状态 不需要
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
    // 打开编辑弹窗
    openConfig?.();
  };

  const handleRemove = async () => {
    // 存在进行中的任务时
    if (generatingType) {
      // 取消继续生成
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
    // 有状态的标记已读
    await markRead();
    // 清空当前渲染的背景图
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
