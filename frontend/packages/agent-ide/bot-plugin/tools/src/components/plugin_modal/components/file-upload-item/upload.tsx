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

import { type FC, type ReactNode, useReducer } from 'react';

import { merge } from 'lodash-es';
import { produce } from 'immer';
import { userStoreService } from '@coze-studio/user-store';
import { I18n } from '@coze-arch/i18n';
import { uploadFileV2 } from '@coze-arch/bot-utils';
import { FileTypeEnum, getFileInfo } from '@coze-studio/file-kit/logic';
import { Upload, Toast, type UploadProps } from '@coze-arch/coze-design';

interface PluginFileUploadProps {
  render: (props: { fileState: FileState; clearFile: () => void }) => ReactNode;
  onUploadSuccess?: (uri: string) => void;
  uploadProps?: Partial<UploadProps>;
  disabled?: boolean;
  defaultUrl?: string;
  defaultFileType: FileTypeEnum | null;
}

interface FileState {
  uri: string;
  url: string;
  name: string;
  type: FileTypeEnum | null;
  uploading: boolean;
  abortSignal: AbortSignal;
}

const getDefaultFileState = (states?: Partial<FileState>): FileState =>
  merge(
    {
      uri: '',
      url: '',
      name: '',
      type: null,
      uploading: false,
      abortSignal: new AbortController().signal,
    } satisfies FileState,
    states,
  );

type Action = Partial<Omit<FileState, 'abortSignal'>>;

export const PluginFileUpload: FC<PluginFileUploadProps> = ({
  disabled = false,
  uploadProps,
  render,
  onUploadSuccess,
  defaultUrl,
  defaultFileType,
}) => {
  // @ts-expect-error -- linter-disable-autofix
  const userId = userStoreService.useUserInfo().user_id_str;
  const [fileState, setFileState] = useReducer(
    (states: FileState, payload: Action) =>
      produce(states, draft => {
        if (!payload) {
          return;
        }

        Object.keys(payload).forEach(key => {
          // @ts-expect-error -- linter-disable-autofix
          draft[key] = payload[key] ?? draft[key];
        });
      }),
    getDefaultFileState({
      url: defaultUrl ?? '',
      type: defaultFileType ?? null,
    }),
  );

  const clearFile = () => setFileState(getDefaultFileState());

  const customRequest: UploadProps['customRequest'] = async ({
    file,
    fileInstance,
  }) => {
    // @ts-expect-error -- linter-disable-autofix
    const type = getFileInfo(fileInstance).fileType;
    setFileState({
      uploading: true,
      url: file.url,
      name: file.name,
    });

    await uploadFileV2({
      userId,
      fileItemList: [
        {
          file: fileInstance,
          fileType: type === FileTypeEnum.IMAGE ? 'image' : 'object',
        },
      ],
      signal: fileState.abortSignal,
      timeout: undefined,
      onSuccess: info => {
        const uri = info?.uploadResult?.Uri;

        if (!uri) {
          return;
        }

        setFileState({
          uploading: false,
          uri,
          type,
        });

        onUploadSuccess?.(uri);
      },
      onUploadError: () => {
        setFileState({
          uploading: false,
        });
      },
    });
  };

  if (typeof render !== 'function') {
    return null;
  }

  return (
    <Upload
      className="w-full"
      draggable
      limit={1}
      disabled={disabled}
      onAcceptInvalid={() => {
        Toast.error(I18n.t('shortcut_Illegal_file_format'));
      }}
      onSizeError={() => {
        if (uploadProps?.maxSize) {
          Toast.error(
            I18n.t('file_too_large', {
              max_size: `${uploadProps.maxSize / 1024}MB`,
            }),
          );
        }
      }}
      customRequest={customRequest}
      showUploadList={false}
      {...uploadProps}
    >
      {render({ fileState, clearFile })}
    </Upload>
  );
};
