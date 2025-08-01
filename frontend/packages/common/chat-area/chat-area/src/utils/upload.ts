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

/* eslint-disable @typescript-eslint/no-explicit-any */
import { type ClipboardEvent } from 'react';

import { isObject } from 'lodash-es';
import {
  getUploader,
  type CozeUploader,
  type EventPayloadMaps,
} from '@coze-studio/uploader-adapter';
import { DEFAULT_MAX_FILE_SIZE } from '@coze-common/chat-uikit-shared';
import { SUCCESS_FILE_ICON_MAP } from '@coze-common/chat-uikit';
import {
  type TFileTypeConfig,
  ContentType,
  type TextMixItem,
  type TextAndFileMixMessagePropsFilePayload,
  type TextAndFileMixMessagePropsImagePayload,
  type ImageModel,
  type ImageMixItem,
  type FileModel,
  type FileMixItem,
  type NormalizedMessagePropsPayload,
  type MessageMentionListFields,
} from '@coze-common/chat-core';
import { FILE_TYPE_CONFIG, FileTypeEnum } from '@coze-common/chat-core';
import { safeAsyncThrow } from '@coze-common/chat-area-utils';
import { type GetUploadAuthTokenData } from '@coze-arch/bot-api/developer_api';
import { DeveloperApi } from '@coze-arch/bot-api';

import { FileType, type FileData, type ImageFileData } from '../store/types';
import { getReportError } from '../report-events';
import { UPLOAD_FILE_TIMEOUT } from '../constants/file';

type UploaderInstance = CozeUploader;
const removeAllListeners = (instance: UploaderInstance) => {
  instance.removeAllListeners('stream-progress');
  instance.removeAllListeners('complete');
  instance.removeAllListeners('error');
  instance.removeAllListeners('progress');
};

// eslint-disable-next-line max-lines-per-function
export function uploadFile({
  file,
  fileType = 'image',
  userId,
  signal,
  onProgress,
  onUploaderReady,
  onUploadError,
  onGetTokenError,
  onSuccess,
}: {
  file: File;
  fileType?: 'image' | 'object';
  userId: string;
  signal: AbortSignal;
  onProgress?: (event: EventPayloadMaps['progress']) => void;
  onUploaderReady?: (uploader: UploaderInstance) => void;
  onUploadError?: (event: EventPayloadMaps['error']) => void;
  onGetTokenError?: (error: Error) => void;
  onSuccess?: (event: EventPayloadMaps['complete']) => void;
}) {
  return new Promise<void>(resolve => {
    let bytedUploader: UploaderInstance | null = null;
    let shouldContinue = true;
    signal?.addEventListener('abort', () => {
      bytedUploader?.cancel();
      shouldContinue = false;
      if (bytedUploader) {
        removeAllListeners(bytedUploader);
      }
      resolve();
    });

    const getToken = async () => {
      try {
        const dataAuth = await DeveloperApi.GetUploadAuthToken(
          {
            scene: 'bot_task',
          },
          { timeout: UPLOAD_FILE_TIMEOUT },
        );
        const result = dataAuth.data;

        if (!result) {
          throw new Error('Invalid GetUploadAuthToken Response');
        }

        return result;
      } catch (e) {
        onGetTokenError?.(getReportError(e).error);
      }
    };

    const upload = (authToken: GetUploadAuthTokenData) => {
      const { service_id, upload_host, auth, schema } =
        authToken as GetUploadAuthTokenData & { schema: string };

      bytedUploader = getUploader(
        {
          schema,
          useFileExtension: true,
          // Solve the error problem:
          userId,
          appId: APP_ID,
          // cp-disable-next-line
          imageHost: `https://${upload_host}`, //imageX upload required
          imageConfig: {
            serviceId: service_id || '', // The service id applied for in the video cloud.
          },
          objectConfig: {
            serviceId: service_id || '',
          },
          imageFallbackHost: IMAGE_FALLBACK_HOST,
          region: BYTE_UPLOADER_REGION,
          uploadTimeout: UPLOAD_FILE_TIMEOUT,
        },
        IS_OVERSEA,
      );

      onUploaderReady?.(bytedUploader);

      bytedUploader.on('complete', inform => {
        onSuccess?.(inform as any);
        resolve();
      });

      bytedUploader.on('error', inform => {
        onUploadError?.(inform as any);
      });

      bytedUploader.on('progress', inform => {
        onProgress?.(inform as any);
      });

      const fileKey = bytedUploader.addFile({
        file,
        stsToken: {
          CurrentTime: auth?.current_time || '',
          ExpiredTime: auth?.expired_time || '',
          SessionToken: auth?.session_token || '',
          AccessKeyId: auth?.access_key_id || '',
          SecretAccessKey: auth?.secret_access_key || '',
        },
        type: fileType, // Upload file type, three optional values: video (video or audio, default), image (picture), object (normal file)
      });

      bytedUploader.start(fileKey);
    };
    const checkShouldContinue = () => shouldContinue;
    const start = async () => {
      if (!checkShouldContinue()) {
        return;
      }
      const authData = await getToken();
      if (!authData) {
        return;
      }
      if (!checkShouldContinue()) {
        return;
      }
      try {
        upload(authData);
      } catch (e) {
        safeAsyncThrow(
          `upload error: ${e instanceof Error ? e.message : String(e)}`,
        );
      }
    };

    start();
  });
}

export const isDirectory = (item?: DataTransferItem | null) => {
  if (typeof item?.webkitGetAsEntry === 'function') {
    return Boolean(item.webkitGetAsEntry()?.isDirectory);
  }
  return false;
};

export const getFileListByDrag = (e: HTMLElementEventMap['drop']): File[] => {
  const fileList = e.dataTransfer?.files;

  const itemList = Array.from(e.dataTransfer?.items ?? []);

  return Array.from(fileList ?? []).filter(
    (file, index): file is File =>
      Boolean(file) && !isDirectory(itemList[index]),
  );
};

export const getFileListByPaste = (
  e: ClipboardEvent<HTMLTextAreaElement>,
): File[] => {
  const itemList = Array.from(e.clipboardData?.items ?? []);

  return Array.from(itemList)
    .map(item => item.getAsFile())
    .filter(
      (file, index): file is File =>
        Boolean(file) && !isDirectory(itemList[index]),
    );
};

export const getFileTypConfig = (file: File) =>
  FILE_TYPE_CONFIG.find(
    config =>
      config.judge?.(file) ||
      config.accept.some(extension => file.name.endsWith(extension)),
  );

export const isFileSizeNotExceed = (file: File) =>
  file.size <= DEFAULT_MAX_FILE_SIZE;

export const isNotEmptyFile = (file: File) => file.size > 0;

export const checkHasFileOnDrag = (e: HTMLElementEventMap['drag']) =>
  // The basis for the judgment is to directly look at the type explanation of types
  Boolean(e.dataTransfer?.types.includes('Files'));

export const formatFileDataListToMessagePayload = (
  fileDataList: FileData[],
): (
  | TextAndFileMixMessagePropsFilePayload
  | TextAndFileMixMessagePropsImagePayload
)[] =>
  fileDataList.map(data => {
    const { uri } = data;
    if (!uri) {
      throw new Error('failed to get file uri');
    }
    if (data.fileType === FileType.File) {
      const filePayload: TextAndFileMixMessagePropsFilePayload = {
        type: ContentType.File,
        file: data.file,
        uri,
      };
      return filePayload;
    }
    const { meta } = data;
    const imagePayload: TextAndFileMixMessagePropsImagePayload = {
      type: ContentType.Image,
      file: data.file,
      uri,
      width: meta?.width ?? 0,
      height: meta?.height ?? 0,
    };
    return imagePayload;
  });

export const isMultimodalContentListLike = (
  value: unknown,
): value is { item_list: unknown[] } =>
  isObject(value) && 'item_list' in value && Array.isArray(value.item_list);

export const isTextMixItem = (value: unknown): value is TextMixItem =>
  isObject(value) &&
  'type' in value &&
  'text' in value &&
  value.type === ContentType.Text;

export const isImageModel = (value: unknown): value is ImageModel =>
  isObject(value) &&
  'key' in value &&
  'image_thumb' in value &&
  'image_ori' in value;

export const isImageMixItem = (value: unknown): value is ImageMixItem =>
  isObject(value) &&
  'type' in value &&
  'image' in value &&
  isImageModel(value.image) &&
  value.type === ContentType.Image;

export const isFileModel = (value: unknown): value is FileModel =>
  isObject(value) &&
  'file_key' in value &&
  'file_name' in value &&
  'file_type' in value &&
  'file_size' in value &&
  'file_url' in value;

export const isFileMixItem = (value: unknown): value is FileMixItem =>
  isObject(value) &&
  'type' in value &&
  'file' in value &&
  isFileMixItem(value.file) &&
  value.type === ContentType.File;

export const getCommonFileIcon = (key?: FileTypeEnum) => {
  if (!key || key === FileTypeEnum.IMAGE) {
    return;
  }

  return SUCCESS_FILE_ICON_MAP[key];
};

export const createNormalizedFilePayload = (
  fileDataList: FileData[],
  mentionList: MessageMentionListFields['mention_list'],
): NormalizedMessagePropsPayload<ContentType.File> => {
  const finalFileList = fileDataList.map(fileData => ({
    ...fileData,
    fileTypeConfig: getFileTypConfig(fileData.file),
  }));

  // To narrow the type use
  const validFinalFileList = finalFileList.filter(
    (
      finalFile,
    ): finalFile is FileData & {
      fileTypeConfig: TFileTypeConfig & { fileType: FileTypeEnum };
      uri: string;
    } =>
      Boolean(finalFile && finalFile.uri && finalFile.fileTypeConfig?.fileType),
  );

  const payload: NormalizedMessagePropsPayload<ContentType.File> = {
    contentType: ContentType.File,
    contentObj: {
      file_list: validFinalFileList.map(finalFile => ({
        file_key: finalFile.uri,
        file_name: finalFile.file.name,
        file_size: finalFile.file.size,
        file_url: '',
        file_type: finalFile.fileTypeConfig.fileType,
      })),
    },
    mention_list: mentionList,
  };
  return payload;
};

export const createNormalizedImagePayload = (
  fileDataList: ImageFileData[],
  mentionList: MessageMentionListFields['mention_list'],
): NormalizedMessagePropsPayload<ContentType.Image> => {
  const finalFileList = fileDataList
    .map(fileData => ({
      ...fileData,
      blobUrl: URL.createObjectURL(fileData.file),
      fileTypeConfig: getFileTypConfig(fileData.file),
    }))
    .filter(
      (
        finalFile,
      ): finalFile is ImageFileData & { uri: string } & {
        blobUrl: string;
        fileTypeConfig: TFileTypeConfig;
      } => Boolean(finalFile.fileTypeConfig && finalFile.uri),
    );

  const payload: NormalizedMessagePropsPayload<ContentType.Image> = {
    contentType: ContentType.Image,
    contentObj: {
      image_list: finalFileList.map(finalFile => ({
        key: finalFile.uri,
        image_thumb: {
          url: finalFile.blobUrl,
          width: finalFile.meta?.width ?? 0,
          height: finalFile.meta?.height ?? 0,
        },
        image_ori: {
          url: finalFile.blobUrl,
          width: finalFile.meta?.width ?? 0,
          height: finalFile.meta?.height ?? 0,
        },
      })),
    },
    mention_list: mentionList,
  };
  return payload;
};
