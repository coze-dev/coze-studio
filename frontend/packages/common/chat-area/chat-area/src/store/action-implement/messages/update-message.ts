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

import { produce } from 'immer';
import { safeAsyncThrow } from '@coze-common/chat-area-utils';

import { type SetStateInternal } from '../helper-type';
import { type MessageStoreState, type UpdateMessage } from '../../messages';
import {
  findMessageIndexById,
  findMessageIndexByIdStruct,
  getIsValidMessage,
  serializeIdStruct,
} from '../../../utils/message';

export const getUpdateMessage =
  (set: SetStateInternal<MessageStoreState>): UpdateMessage =>
  (idOrStruct, newMessage) => {
    set(
      produce<MessageStoreState>(state => {
        const isId = typeof idOrStruct === 'string';

        if (isId) {
          const isValidMessage = getIsValidMessage(newMessage);
          if (!isValidMessage) {
            safeAsyncThrow('message is required when use id to updateMessage');
            return;
          }
          const idx = findMessageIndexById(state.messages, idOrStruct);
          if (idx < 0) {
            safeAsyncThrow(`cannot find message with id ${idOrStruct}`);
            return;
          }
          state.messages[idx] = newMessage;
          return;
        }

        const idx = findMessageIndexByIdStruct(state.messages, idOrStruct);
        if (idx < 0) {
          safeAsyncThrow(
            `cannot find message with id ${serializeIdStruct(idOrStruct)}`,
          );
          return;
        }
        if (newMessage) {
          state.messages[idx] = newMessage;
        } else if (getIsValidMessage(idOrStruct)) {
          state.messages[idx] = idOrStruct;
        } else {
          safeAsyncThrow('id struct is not valid message');
        }
      }),
      false,
      'updateMessage',
    );
  };
