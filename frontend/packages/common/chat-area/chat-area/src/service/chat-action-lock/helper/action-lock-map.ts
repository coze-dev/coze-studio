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
  type GetGlobalActionLockUpdateFn,
  type GetIsGlobalActionLockFn,
  type GetAnswerActionLockUpdateFn,
  type GetAnswerActionUnLockUpdateFn,
  type GetIsAnswerActionLockFn,
} from '../type';
import {
  type GlobalActionLockUpdateFn,
  type AnswerActionType,
  type GlobalActionType,
  type AnswerActionLock,
} from '../../../store/chat-action';

const getDefaultAnswerActionLock: () => AnswerActionLock = () => ({
  deleteMessageGroup: null,
  regenerate: null,
});

export const globalActionLockUpdateFnMap: Record<
  GlobalActionType,
  GetGlobalActionLockUpdateFn<GlobalActionType>
> = {
  sendMessageToACK:
    ({ timestamp, param }) =>
    globalActionLock => {
      globalActionLock.sendMessageToACK = {
        timestamp,
        messageUniqKey: param?.messageUniqKey ?? null,
      };
    },
  clearContext:
    ({ timestamp }) =>
    globalActionLock => {
      globalActionLock.clearContext = {
        timestamp,
      };
    },
  clearHistory:
    ({ timestamp }) =>
    globalActionLock => {
      globalActionLock.clearHistory = {
        timestamp,
      };
    },
};

export const globalActionUnLockUpdateFnMap: Record<
  GlobalActionType,
  GlobalActionLockUpdateFn
> = {
  sendMessageToACK: globalLock => {
    globalLock.sendMessageToACK = null;
  },

  clearContext: globalLock => {
    globalLock.clearContext = null;
  },
  clearHistory: globalLock => {
    globalLock.clearHistory = null;
  },
};

export const getIsGlobalActionLockMap: Record<
  GlobalActionType,
  GetIsGlobalActionLockFn
> = {
  sendMessageToACK: globalLock =>
    Boolean(globalLock.sendMessageToACK) ||
    Boolean(globalLock.clearHistory) ||
    Boolean(globalLock.clearContext),

  clearContext: globalLock =>
    Boolean(globalLock.sendMessageToACK) ||
    Boolean(globalLock.clearHistory) ||
    Boolean(globalLock.clearContext),

  clearHistory: globalLock =>
    Boolean(globalLock.sendMessageToACK) ||
    Boolean(globalLock.clearHistory) ||
    Boolean(globalLock.clearContext),
};

export const answerActionLockUpdateFnMap: Record<
  AnswerActionType,
  GetAnswerActionLockUpdateFn
> = {
  deleteMessageGroup:
    (groupId, { timestamp }) =>
    lockMap => {
      const targetGroup = lockMap[groupId];
      if (!targetGroup) {
        lockMap[groupId] = {
          ...getDefaultAnswerActionLock(),
          deleteMessageGroup: { timestamp },
        };
        return;
      }
      targetGroup.deleteMessageGroup = { timestamp };
    },
  regenerate:
    (groupId, { timestamp }) =>
    lockMap => {
      const targetGroup = lockMap[groupId];
      if (!targetGroup) {
        lockMap[groupId] = {
          ...getDefaultAnswerActionLock(),
          regenerate: { timestamp },
        };
        return;
      }
      targetGroup.regenerate = { timestamp };
    },
};

export const answerActionUnLockUpdateFnMap: Record<
  AnswerActionType,
  GetAnswerActionUnLockUpdateFn
> = {
  deleteMessageGroup: groupId => lockMap => {
    const targetGroup = lockMap[groupId];
    if (!targetGroup) {
      return;
    }
    targetGroup.deleteMessageGroup = null;
  },
  regenerate: groupId => lockMap => {
    const targetGroup = lockMap[groupId];
    if (!targetGroup) {
      return;
    }
    targetGroup.regenerate = null;
  },
};

export const getIsAnswerActionLockMap: Record<
  AnswerActionType,
  GetIsAnswerActionLockFn
> = {
  deleteMessageGroup: (groupId, lockMap, globalActionLock) =>
    Boolean(lockMap[groupId]?.deleteMessageGroup) ||
    globalActionLock.sendMessageToACK?.messageUniqKey === groupId,

  regenerate: (groupId, lockMap, globalActionLock) =>
    Boolean(lockMap[groupId]?.regenerate) ||
    getIsGlobalActionLockMap.sendMessageToACK(globalActionLock),
};
