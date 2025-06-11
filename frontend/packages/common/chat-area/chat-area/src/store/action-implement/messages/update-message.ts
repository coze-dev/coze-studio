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
