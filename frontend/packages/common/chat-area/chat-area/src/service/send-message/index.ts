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
  ContentType,
  type TextAndFileMixMessageProps,
} from '@coze-common/chat-core';
import { type SendTextMessagePayload } from '@coze-common/chat-uikit-shared';

import {
  createNormalizedFilePayload,
  createNormalizedImagePayload,
  formatFileDataListToMessagePayload,
} from '../../utils/upload';
import { FileType, type ImageFileData } from '../../store/types';
import { type BatchFileUploadStore } from '../../store/batch-upload-file';
import {
  type useSendTextMessage,
  type useSendMultimodalMessage,
  type useSendNormalizedMessage,
} from '../../hooks/messages/use-send-message';
import { type SendMessageFrom } from '../../context/chat-area-context/chat-area-callback';

interface SendMessageServiceConstructorContext {
  methods: {
    sendTextMessage: ReturnType<typeof useSendTextMessage>;
    sendMultimodalMessage: ReturnType<typeof useSendMultimodalMessage>;
    sendNormalizedMessage: ReturnType<typeof useSendNormalizedMessage>;
  };
  storeSets: {
    useBatchFileUploadStore: BatchFileUploadStore;
  };
}

export interface SendMessagePayload extends SendTextMessagePayload {
  audioFile?: File;
}

export interface SendMessageParams {
  inputPayload: SendMessagePayload;
  from: SendMessageFrom;
}

export class SendMessageService {
  context: SendMessageServiceConstructorContext;
  constructor(params: SendMessageServiceConstructorContext) {
    this.context = params;
  }

  sendTextMessage(params: SendMessageParams) {
    const { methods } = this.context;
    const { inputPayload, from } = params;
    return methods.sendTextMessage(inputPayload, from);
  }

  sendFileMessage(params: SendMessageParams) {
    const {
      storeSets: { useBatchFileUploadStore },
      methods: { sendNormalizedMessage },
    } = this.context;
    const { inputPayload, from } = params;

    const fileDataList = useBatchFileUploadStore.getState().getFileDataList();
    const isFileTypeError = fileDataList.some(
      fileData => fileData?.fileType !== FileType.File,
    );

    if (isFileTypeError) {
      throw new Error(
        `invalid send single common file message ${fileDataList}`,
      );
    }

    const normalizedFilePayload = createNormalizedFilePayload(
      fileDataList,
      inputPayload.mentionList,
    );

    return sendNormalizedMessage({ payload: normalizedFilePayload }, from);
  }

  sendImageMessage(params: SendMessageParams) {
    const {
      storeSets: { useBatchFileUploadStore },
      methods: { sendNormalizedMessage },
    } = this.context;
    const { inputPayload, from } = params;

    const fileDataList = useBatchFileUploadStore.getState().getFileDataList();
    const isFileTypeError = fileDataList.some(
      fileData => fileData.fileType !== FileType.Image,
    );

    if (isFileTypeError) {
      throw new Error(
        `invalid send single common file message ${fileDataList}`,
      );
    }

    const filteredFileDataList = fileDataList.filter(
      (fileData): fileData is ImageFileData =>
        fileData.fileType === FileType.Image,
    );

    const normalizedImagePayload = createNormalizedImagePayload(
      filteredFileDataList,
      inputPayload.mentionList,
    );

    return sendNormalizedMessage({ payload: normalizedImagePayload }, from);
  }

  sendMultimodalMessage(params: SendMessageParams) {
    const {
      storeSets: { useBatchFileUploadStore },
      methods: { sendMultimodalMessage },
    } = this.context;
    const { inputPayload, from } = params;

    const mixList: TextAndFileMixMessageProps['payload']['mixList'] = [
      ...formatFileDataListToMessagePayload(
        useBatchFileUploadStore.getState().getFileDataList(),
      ),
      {
        type: ContentType.Text,
        text: inputPayload.text,
      },
    ];
    return sendMultimodalMessage(
      {
        payload: {
          mixList,
          mention_list: inputPayload.mentionList,
        },
        audioFile: inputPayload.audioFile,
      },
      from,
    );
  }
}
