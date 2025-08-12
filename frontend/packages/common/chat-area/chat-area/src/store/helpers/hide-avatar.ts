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

import { type MessageMeta } from '../types';
import {
  getIsAsyncResultMessage,
  getIsTriggerMessage,
  getIsVisibleMessageMeta,
} from '../../utils/message';
import { type ChatAreaConfigs } from '../../context/chat-area-context/type';

/**
 * Scanning the meta from front to back, the actual effect is from bottom to top (shown in reverse order);
 * If the current bar has the same role as the previous bar, the current bar hides the avatar
 */
export const scanAndUpdateHideAvatar = (
  metaList: MessageMeta[],
  configs: Partial<ChatAreaConfigs>,
) => {
  const visibleMessageMeta = metaList.filter(meta =>
    getIsVisibleMessageMeta(meta, configs),
  );
  if (visibleMessageMeta.length <= 1) {
    return;
  }

  if (configs.groupUserMessage) {
    scanAndUpdateHideAvatarForOther(visibleMessageMeta);
  } else {
    scanAndUpdateHideAvatarForDebug(visibleMessageMeta);
  }
};

export const scanAndUpdateHideAvatarForOther = (metaList: MessageMeta[]) => {
  for (let i = 0; i < metaList.length - 1; i++) {
    const later = metaList[i];
    const earlier = metaList[i + 1];
    if (!later || !earlier) {
      continue;
    }

    if (later.role !== earlier.role) {
      continue;
    }

    if (later.role !== 'assistant') {
      continue;
    }

    if (later.sectionId !== earlier.sectionId) {
      continue;
    }

    // The pushed task messages are grouped separately and the avatar is displayed.
    if (getIsTriggerMessage(later)) {
      continue;
    }

    if (getIsAsyncResultMessage(later)) {
      continue;
    }
    later.hideAvatar = true;
  }
};

export const scanAndUpdateHideAvatarForDebug = (metaList: MessageMeta[]) => {
  for (let i = 0; i < metaList.length - 1; i++) {
    const later = metaList[i];
    const earlier = metaList[i + 1];
    if (!later || !earlier) {
      continue;
    }

    if (later.role !== earlier.role) {
      continue;
    }

    if (later.role === 'user') {
      continue;
    }

    if (later.role !== 'assistant') {
      continue;
    }

    if (later.replyId !== earlier.replyId) {
      continue;
    }

    later.hideAvatar = true;
  }
};
