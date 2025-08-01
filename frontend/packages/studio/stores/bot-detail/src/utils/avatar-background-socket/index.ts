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

import { withSlardarIdButton } from '@coze-studio/bot-utils';
import { logger } from '@coze-arch/logger';
import { I18n } from '@coze-arch/i18n';
import { arrayBufferToObject } from '@coze-arch/bot-utils';
import { type GenPicMessage, PicType } from '@coze-arch/bot-api/playground_api';
import { PlaygroundApi } from '@coze-arch/bot-api';
import webSocketManager, {
  type Connection,
  type FrontierEventMap,
} from '@coze-common/websocket-manager-adapter';
import { Toast } from '@coze-arch/coze-design';

import { getBotDetailIsReadonly } from '../get-read-only';
import { DotStatus } from '../../types/generate-image';
import { useGenerateImageStore } from '../../store/generate-image-store';
import { useBotInfoStore } from '../../store/bot-info';

class AvatarBackgroundWebSocket {
  private connection: Connection | undefined;
  private eventListenerList:
    | Array<{
        key: keyof FrontierEventMap;
        listener: (event) => void;
      }>
    | undefined;
  private biz: string;
  private service: number | undefined;
  private taskSet = new Set();

  constructor(biz: string, service: number) {
    this.biz = biz;
    this.service = service;
  }

  createConnection(retry = true) {
    if (this.connection) {
      return;
    }
    try {
      this.connection = webSocketManager.createConnection({
        biz: this.biz,
        service: this.service,
      });
      this.addWSEventListener();
    } catch (error) {
      // Try again.
      if (retry) {
        this.createConnection(false);
      }
    }
  }

  destroy() {
    if (this.connection) {
      this.eventListenerList?.forEach(({ key, listener }) => {
        this.connection?.removeEventListener(key, listener);
      });
      this.connection?.close();
      this.connection = undefined;
    }
  }

  private addWSEventListener() {
    this.eventListenerList = [
      { key: 'message', listener: this.onSocketMessage },
      { key: 'error', listener: this.onSocketError },
    ];
    this.eventListenerList?.forEach(({ key, listener }) => {
      this.connection?.addEventListener(key, listener);
    });
  }

  private onSocketMessage = event => {
    const payload = arrayBufferToObject(
      event?.message?.payload,
    ) as GenPicMessage;
    const task = payload?.pic_task;
    const taskId = task?.id || '';
    if (this.taskSet.has(taskId)) {
      logger.info({
        message: 'duplicate task',
        meta: { taskId },
      });
      return;
    }
    this.taskSet.add(taskId);
    const botId = useBotInfoStore.getState().botId || '0';

    if (botId !== '0' && getBotDetailIsReadonly()) {
      return;
    }
    const taskBotId = task?.bot_id || '0';
    if (task && taskBotId === botId) {
      const {
        generateAvatarModal,
        generateBackGroundModal,
        setGenerateAvatarModalByImmer,
        setGenerateBackgroundModalByImmer,
        pushImageList,
      } = useGenerateImageStore.getState();
      const {
        gif: { dotStatus: avatarGifDotStatus },
        image: { dotStatus: avatarStaticImageDotStatus },
      } = generateAvatarModal;
      const {
        gif: { dotStatus: backgroundGifDotStatus },
        image: { dotStatus: backgroundStaticImageDotStatus },
      } = generateBackGroundModal;
      const { status } = task;
      // Update avatar or background after receiving message
      const updateState = (
        key: string,
        setImmer:
          | typeof setGenerateAvatarModalByImmer
          | typeof setGenerateBackgroundModalByImmer,
        currentDotStatus: DotStatus,
      ) => {
        let dotStatus = DotStatus.None;
        if (currentDotStatus === DotStatus.Generating) {
          dotStatus =
            (status as number) === DotStatus.Success
              ? DotStatus.Success
              : DotStatus.Fail;
        } else {
          // Mark as read
          if (taskBotId !== '0') {
            PlaygroundApi.MarkReadNotice({
              bot_id: taskBotId,
              pic_type: task.type,
            });
          }
          if ((status as number) === DotStatus.Fail) {
            Toast.error({
              content: withSlardarIdButton(
                payload?.err_msg || I18n.t('profilepicture_toast_failed'),
              ),
            });
          } else if ((status as number) === DotStatus.Success) {
            Toast.success(I18n.t('profilepicture_toast_generated'));
          }
        }
        setImmer(state => {
          state[key] = {
            ...state[key],
            loading: false,
            dotStatus,
            generateTaskId: '',
          };
          if ((status as number) === DotStatus.Success) {
            state.selectedImage = task;
          }
        });
        if ((status as number) === DotStatus.Success) {
          pushImageList(task);
        }
      };
      switch (task.type) {
        case PicType.IconGif: {
          updateState('gif', setGenerateAvatarModalByImmer, avatarGifDotStatus);
          break;
        }
        case PicType.IconStatic: {
          updateState(
            'image',
            setGenerateAvatarModalByImmer,
            avatarStaticImageDotStatus,
          );
          break;
        }
        case PicType.BackgroundGif: {
          updateState(
            'gif',
            setGenerateBackgroundModalByImmer,
            backgroundGifDotStatus,
          );
          break;
        }
        case PicType.BackgroundStatic: {
          updateState(
            'image',
            setGenerateBackgroundModalByImmer,
            backgroundStaticImageDotStatus,
          );
          break;
        }
        default:
      }
    }
  };

  private onSocketError = event => {
    // TODO
  };
}

const getPluginServiceId = () => {
  // Region/service_id mapping
  const regionServiceIdMap = {
    boe: 16778137,
    cn: 33554636,
    sg: 67108932,
    va: 67108932,
  };
  return regionServiceIdMap[IS_BOE ? 'boe' : REGION];
};
const serviceID = getPluginServiceId();

export const avatarBackgroundWebSocket = new AvatarBackgroundWebSocket(
  'EditorPic',
  serviceID,
);

export function initAvatarBackgroundWebSocket() {
  // Create connection
  setTimeout(() => {
    const {
      generateAvatarModal: {
        gif: { dotStatus: avatarGifDotStatus },
        image: { dotStatus: avatarStaticImageDotStatus },
      },
      generateBackGroundModal: {
        gif: { dotStatus: backgroundGifDotStatus },
        image: { dotStatus: backgroundStaticImageDotStatus },
      },
    } = useGenerateImageStore.getState();
    if (
      [
        avatarGifDotStatus,
        avatarStaticImageDotStatus,
        backgroundGifDotStatus,
        backgroundStaticImageDotStatus,
      ].includes(DotStatus.Generating)
    ) {
      avatarBackgroundWebSocket.createConnection();
    }
  }, 10);
}
