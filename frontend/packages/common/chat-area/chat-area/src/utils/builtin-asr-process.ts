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

import { cloneDeep } from 'lodash-es';
import { ContentType, type ChatCore } from '@coze-common/chat-core';

import { type Message } from '../store/types';
import { type MessageStoreStateAction } from '../store/messages';
import { type FileAction } from '../store/file';
import { getIsMultimodalMessage, getIsTextMessage } from './message';

const FORM_DATA_KEY = 'file';

export const builtinASRProcess = async (
  message: Message,
  {
    chatCore,
    audioFile,
  }: {
    chatCore: ChatCore | null;
    audioFile: File;
  },
) => {
  if (!chatCore) {
    return;
  }

  const formData = new FormData();
  formData.append(FORM_DATA_KEY, audioFile);
  const response = await chatCore.chatASR(formData);
  const translationText = response?.data?.text;

  if (!translationText) {
    return;
  }

  const clonedMessage = cloneDeep(message);
  if (getIsTextMessage(clonedMessage)) {
    clonedMessage.content = translationText;
  }

  if (getIsMultimodalMessage(clonedMessage)) {
    const textItem = clonedMessage.content_obj.item_list.find(
      item => item.type === ContentType.Text,
    );
    if (textItem) {
      textItem.text = translationText;
      clonedMessage.content = JSON.stringify(clonedMessage.content_obj);
    }
  }

  return clonedMessage;
};

export const revertVoiceMessageConditionally = ({
  message,
  deleteMessageByIdStruct,
  getAudioProcessStateByLocalId,
}: {
  message: Message;
  getAudioProcessStateByLocalId: FileAction['getAudioProcessStateByLocalId'];
  deleteMessageByIdStruct: MessageStoreStateAction['deleteMessageByIdStruct'];
}) => {
  const localMessageId = message.extra_info.local_message_id;
  const audioProcessState = getAudioProcessStateByLocalId(localMessageId);

  if (audioProcessState !== 'processing') {
    return;
  }
  deleteMessageByIdStruct(message);
  return 'reverted';
};

export const removeAudioFileAfterSendMessage = ({
  message,
  removeAudioFileByLocalId,
  updateAudioProcessState,
}: {
  message: Message;
  removeAudioFileByLocalId: FileAction['removeAudioFileByLocalId'];
  updateAudioProcessState: FileAction['updateAudioProcessState'];
}) => {
  const localMessageId = message.extra_info.local_message_id;
  removeAudioFileByLocalId(localMessageId);
  updateAudioProcessState({ localMessageId, state: 'finish' });
};
