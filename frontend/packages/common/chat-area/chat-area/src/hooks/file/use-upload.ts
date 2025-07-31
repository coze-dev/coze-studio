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

import { useChatAreaStoreSet } from '../context/use-chat-area-context';
import { FileStatus, FileType } from '../../store/types';
import { useUploadController } from '../../context/upload-controller-context';
import { MAX_UPLOAD_PROGRESS } from '../../constants/file';

const useUpload = () => {
  const { useBatchFileUploadStore, useSenderInfoStore } = useChatAreaStoreSet();

  const { createControllerAndUpload, cancelUploadById } = useUploadController();
  const userInfo = useSenderInfoStore(state => state.userInfo);
  return (fileId: string, file: File) => {
    if (!userInfo) {
      throw new Error('failed to get user info');
    }

    const { immerUpdateFileDataById } = useBatchFileUploadStore.getState();
    createControllerAndUpload({
      fileId,
      file,
      userId: userInfo.id,
      onReady: (_e, id) => {
        immerUpdateFileDataById(id, data => {
          data.status = FileStatus.Uploading;
        });
      },
      onProgress: (event, id) => {
        immerUpdateFileDataById(id, data => {
          data.percent = event.percent;
        });
      },
      onComplete: ({ uploadResult }, id) => {
        immerUpdateFileDataById(id, data => {
          data.status = FileStatus.Success;
          data.percent = MAX_UPLOAD_PROGRESS;
          const uri = uploadResult.Uri;

          if (!uri) {
            data.status = FileStatus.Error;
            throw new Error('upload complete without uri');
          }

          data.uri = uri;

          if (data.fileType !== FileType.Image) {
            return;
          }

          data.meta = {
            width: uploadResult.ImageWidth ?? 0,
            height: uploadResult.ImageHeight ?? 0,
          };
        });
      },
      onError: (_e, id) => {
        immerUpdateFileDataById(id, data => {
          data.status = FileStatus.Error;
        });
        cancelUploadById(id);
      },
    });
  };
};

export const useCreateFileAndUpload = () => {
  const { useBatchFileUploadStore } = useChatAreaStoreSet();
  const upload = useUpload();
  return (fileId: string, file: File) => {
    const { immerCreateFileData } = useBatchFileUploadStore.getState();
    immerCreateFileData(fileId, file);
    upload(fileId, file);
  };
};

export const useRetryUpload = () => {
  const upload = useUpload();
  const { useBatchFileUploadStore } = useChatAreaStoreSet();
  return (fileId: string, file: File) => {
    const { immerUpdateFileDataById } = useBatchFileUploadStore.getState();
    immerUpdateFileDataById(fileId, state => {
      state.percent = 0;
      state.status = FileStatus.Init;
    });
    upload(fileId, file);
  };
};
