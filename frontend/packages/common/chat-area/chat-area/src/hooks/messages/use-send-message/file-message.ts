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
import { cloneDeep } from 'lodash-es';
import { type ContentType } from '@coze-common/chat-uikit';
import {
  type TextAndFileMixMessageProps,
  type SendMessageOptions,
  type NormalizedMessageProps,
  type UploadPluginInterface,
} from '@coze-common/chat-core';
import { type SendFileMessagePayload } from '@coze-common/chat-uikit-shared';

import { useChatCore } from '../../context/use-chat-core';
import { useChatAreaStoreSet } from '../../context/use-chat-area-context';
import { modifyFileMessagePercentAndStatus } from '../../../utils/modify-file-message-percent-and-status';
import {
  getIsImageMessage,
  toastBySendMessageResult,
} from '../../../utils/message';
import {
  addFileUploader,
  fileManager,
  FileManagerEventNames,
  removeFileUploader,
} from '../../../utils/file-manage';
import {
  type FileMessage,
  FileStatus,
  type ImageMessage,
  type MultimodalMessage,
  type NormalizedFileMessage,
} from '../../../store/types';
import type { EventPayloadMap } from '../../../service/upload-plugin';
import type { SendMessageFrom } from '../../../context/chat-area-context/chat-area-callback';
import { useSendNewMessage } from './new-message';

const useCreateImageMessage = () => {
  const { useSectionIdStore, useFileStore, useWaitingStore, useMessagesStore } =
    useChatAreaStoreSet();
  const chatCore = useChatCore();
  const latestSectionId = useSectionIdStore(state => state.latestSectionId);

  const { updateTemporaryFile } = useFileStore(
    useShallow(state => ({
      updateTemporaryFile: state.updateTemporaryFile,
    })),
  );

  const { clearSending } = useWaitingStore(
    useShallow(state => ({
      clearSending: state.clearSending,
    })),
  );

  const { updateMessage, findMessage } = useMessagesStore(
    useShallow(
      useShallow(state => ({
        updateMessage: state.updateMessage,
        findMessage: state.findMessage,
      })),
    ),
  );

  return (payload: SendFileMessagePayload): ImageMessage => {
    const { file, mentionList } = payload;
    const unsentMessage = chatCore.createImageMessage<EventPayloadMap>(
      {
        payload: {
          file,
          mention_list: mentionList,
        },
        pluginUploadManager: (
          uploader: UploadPluginInterface<EventPayloadMap>,
        ) => {
          fileManager.on(
            FileManagerEventNames.CANCEL_UPLOAD_FILE,
            localMessageId => {
              const unsentMessageLocalMessageId =
                unsentMessage.extra_info.local_message_id;
              if (localMessageId !== unsentMessageLocalMessageId) {
                return;
              }
              removeFileUploader(unsentMessageLocalMessageId);
              clearSending();
            },
          );

          uploader.on('complete', () => {
            removeFileUploader(unsentMessage.extra_info.local_message_id);
            fileManager.off(FileManagerEventNames.CANCEL_UPLOAD_FILE);
          });

          uploader.on('ready', () => {
            addFileUploader({
              localMessageId: unsentMessage.extra_info.local_message_id,
              uploader,
            });
            updateTemporaryFile(
              unsentMessage.extra_info.local_message_id,
              payload,
            );
          });

          uploader.on('error', () => {
            const msg = cloneDeep(unsentMessage);
            removeFileUploader(msg.extra_info.local_message_id);
            updateTemporaryFile(msg.extra_info.local_message_id, payload);

            if (getIsImageMessage(msg)) {
              msg._sendFailed = true;
              msg.is_finish = true;
            }

            if (findMessage(msg.extra_info.local_message_id)) {
              updateMessage(msg.extra_info.local_message_id, msg);
            }

            clearSending();
          });
        },
      },
      {
        section_id: latestSectionId,
      },
    );
    return unsentMessage;
  };
};

// eslint-disable-next-line max-lines-per-function
const useCreateFileMessage = () => {
  const { useSectionIdStore, useFileStore, useMessagesStore, useWaitingStore } =
    useChatAreaStoreSet();
  const chatCore = useChatCore();
  const latestSectionId = useSectionIdStore(state => state.latestSectionId);

  const { updateTemporaryFile } = useFileStore(
    useShallow(state => ({
      updateTemporaryFile: state.updateTemporaryFile,
    })),
  );

  const { updateMessage, findMessage } = useMessagesStore(
    useShallow(
      useShallow(state => ({
        updateMessage: state.updateMessage,
        findMessage: state.findMessage,
      })),
    ),
  );

  const { clearSending } = useWaitingStore(
    useShallow(state => ({
      clearSending: state.clearSending,
    })),
  );

  return (payload: SendFileMessagePayload): FileMessage => {
    const { file, mentionList } = payload;
    const unsentMessage = chatCore.createFileMessage<EventPayloadMap>(
      {
        payload: {
          file,
          mention_list: mentionList,
        },
        pluginUploadManager: (
          uploader: UploadPluginInterface<EventPayloadMap>,
        ) => {
          fileManager.on(
            FileManagerEventNames.CANCEL_UPLOAD_FILE,
            localMessageId => {
              const unsentMessageLocalMessageId =
                unsentMessage.extra_info.local_message_id;
              if (localMessageId !== unsentMessageLocalMessageId) {
                return;
              }
              removeFileUploader(unsentMessageLocalMessageId);
              const msg = modifyFileMessagePercentAndStatus(unsentMessage, {
                status: FileStatus.Canceled,
                percent: 0,
              });
              msg.is_finish = true;
              if (findMessage(msg.extra_info.local_message_id)) {
                updateMessage(msg.extra_info.local_message_id, msg);
              }
              clearSending();
            },
          );

          uploader.on('progress', info => {
            const msg = modifyFileMessagePercentAndStatus(unsentMessage, {
              status: FileStatus.Uploading,
              percent: info.percent,
            });
            if (findMessage(msg.extra_info.local_message_id)) {
              updateMessage(msg.extra_info.local_message_id, msg);
            }
          });

          uploader.on('complete', () => {
            removeFileUploader(unsentMessage.extra_info.local_message_id);
            const msg = modifyFileMessagePercentAndStatus(unsentMessage, {
              status: FileStatus.Success,
              percent: 100,
            });
            if (findMessage(msg.extra_info.local_message_id)) {
              updateMessage(msg.extra_info.local_message_id, msg);
            }
            fileManager.off(FileManagerEventNames.CANCEL_UPLOAD_FILE);
          });

          uploader.on('ready', () => {
            addFileUploader({
              localMessageId: unsentMessage.extra_info.local_message_id,
              uploader,
            });
            updateTemporaryFile(
              unsentMessage.extra_info.local_message_id,
              payload,
            );
            const msg = modifyFileMessagePercentAndStatus(unsentMessage, {
              status: FileStatus.Uploading,
              percent: 0,
            });
            if (findMessage(msg.extra_info.local_message_id)) {
              updateMessage(msg.extra_info.local_message_id, msg);
            }
          });

          uploader.on('error', () => {
            removeFileUploader(unsentMessage.extra_info.local_message_id);
            updateTemporaryFile(
              unsentMessage.extra_info.local_message_id,
              payload,
            );
            const msg = modifyFileMessagePercentAndStatus(unsentMessage, {
              status: FileStatus.Error,
              percent: 0,
            });
            msg._sendFailed = true;
            msg.is_finish = true;

            if (findMessage(msg.extra_info.local_message_id)) {
              updateMessage(msg.extra_info.local_message_id, msg);
            }
            clearSending();
          });
        },
      },
      {
        section_id: latestSectionId,
      },
    );

    return unsentMessage;
  };
};

export const useSendFileMessage = () => {
  const createFileMessage = useCreateFileMessage();
  const sendMessage = useSendNewMessage();

  return (payload: SendFileMessagePayload, from: SendMessageFrom) => {
    const unsentMessage = createFileMessage(payload);
    sendMessage(unsentMessage, from);
  };
};

export const useCreateMultimodalMessage = () => {
  const { useSectionIdStore } = useChatAreaStoreSet();
  const chatCore = useChatCore();
  const latestSectionId = useSectionIdStore(state => state.latestSectionId);
  return (payload: TextAndFileMixMessageProps): MultimodalMessage => {
    const unsentMessage = chatCore.createTextAndFileMixMessage(payload, {
      section_id: latestSectionId,
    });

    return unsentMessage;
  };
};

export const useSendImageMessage = () => {
  const createImageMessage = useCreateImageMessage();
  const sendMessage = useSendNewMessage();

  return (payload: SendFileMessagePayload, from: SendMessageFrom) => {
    const unsentMessage = createImageMessage(payload);
    sendMessage(unsentMessage, from);
  };
};

export const useSendMultimodalMessage = () => {
  const sendMessage = useSendNewMessage();
  const createMultimodalMessage = useCreateMultimodalMessage();
  const { useBatchFileUploadStore, useFileStore } = useChatAreaStoreSet();
  return async (
    payload: TextAndFileMixMessageProps & { audioFile?: File },
    from: SendMessageFrom,
    options?: SendMessageOptions,
  ) => {
    const unsentMessage = createMultimodalMessage(payload);
    useBatchFileUploadStore.getState().clearAllData();
    if (payload.audioFile) {
      useFileStore.getState().addAudioFile({
        localMessageId: unsentMessage.extra_info.local_message_id,
        audioFile: payload.audioFile,
      });
    }
    const result = await sendMessage(unsentMessage, from, options);
    toastBySendMessageResult(result);
  };
};
const useCreateNormalizedMessage = () => {
  const { useSectionIdStore } = useChatAreaStoreSet();
  const chatCore = useChatCore();
  const latestSectionId = useSectionIdStore(state => state.latestSectionId);
  return <T extends ContentType.Image | ContentType.File>(
    props: NormalizedMessageProps<T>,
  ): NormalizedFileMessage =>
    chatCore.createNormalizedPayloadMessage<T>(props, {
      section_id: latestSectionId,
    });
};
export const useSendNormalizedMessage = () => {
  const sendMessage = useSendNewMessage();
  const createNormalizedMessage = useCreateNormalizedMessage();
  const { useBatchFileUploadStore } = useChatAreaStoreSet();
  return <T extends ContentType.Image | ContentType.File>(
    props: NormalizedMessageProps<T>,
    from: SendMessageFrom,
  ) => {
    const unsentMessage = createNormalizedMessage(props);
    useBatchFileUploadStore.getState().clearAllData();
    sendMessage(unsentMessage, from);
  };
};
