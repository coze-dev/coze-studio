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

import { logger } from '@coze-arch/logger';
import { getFlags } from '@coze-arch/bot-flags';
import { PlaygroundApi } from '@coze-arch/bot-api';

import { getBotDetailIsReadonly } from '../utils/get-read-only';
import {
  getInitAvatarInfo,
  getInitBackgroundInfo,
} from '../utils/generate-image';
import { initAvatarBackgroundWebSocket } from '../utils/avatar-background-socket';
import { useGenerateImageStore } from '../store/generate-image-store';
import { useBotInfoStore } from '../store/bot-info';

export const initGenerateImageStore = async () => {
  try {
    const {
      updateImageList,
      updateNoticeList,
      setGenerateAvatarModalByImmer,
      setGenerateBackgroundModalByImmer,
      clearGenerateImageStore,
    } = useGenerateImageStore.getState();
    const { botId } = useBotInfoStore.getState();

    const isReadOnly = getBotDetailIsReadonly();
    const FLAGS = getFlags();

    if (isReadOnly || !FLAGS['bot.studio.gif_avater_background']) {
      return;
    }

    // Initialize it to prevent jumping from the create page to the edit page and bring the state of the created page
    clearGenerateImageStore();

    const resp = await PlaygroundApi.GetPicTask({
      bot_id: botId,
    });
    const respData = resp?.data ?? {};
    const { tasks = [], notices = [] } = respData;
    updateImageList(tasks);
    updateNoticeList(notices);
    setGenerateAvatarModalByImmer(state => {
      getInitAvatarInfo(respData, state);
    });

    setGenerateBackgroundModalByImmer(state => {
      getInitBackgroundInfo(respData, state);
    });

    initAvatarBackgroundWebSocket();
  } catch (error) {
    const e = error instanceof Error ? error : new Error(error as string);
    logger.error({ error: e });
  }
};
