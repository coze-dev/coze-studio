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

import { AxiosError } from 'axios';
import { type UploadProps } from '@coze-arch/coze-design';
import { upLoadFile } from '@coze-arch/bot-utils';
import { ProductApi } from '@coze-arch/bot-api';

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader();
    fileReader.onload = event => {
      const result = event.target?.result;
      if (typeof result === 'string') {
        resolve(result.slice(result.indexOf(',') + 1));
      } else {
        reject(new Error('readAsDataURL failed'));
      }
    };
    fileReader.readAsDataURL(file);
  });
}

export const uploadCustomRequest: UploadProps['customRequest'] = async args => {
  const { fileInstance, onProgress, onSuccess, onError } = args;
  try {
    if (!fileInstance) {
      throw new Error('no file to upload');
    }
    const result = await ProductApi.PublicUploadImage(
      { data: await fileToBase64(fileInstance) },
      {
        onUploadProgress: e =>
          onProgress({ total: e.total ?? fileInstance.size, loaded: e.loaded }),
      },
    );
    onSuccess(result.data);
  } catch (e) {
    if (e instanceof AxiosError) {
      onError(e.request);
    } else {
      onError({});
    }
  }
};

export const uploadCustomRequestImageX: UploadProps['customRequest'] =
  async args => {
    const { fileInstance, onProgress, onSuccess, onError } = args;
    try {
      if (!fileInstance) {
        throw new Error('no file to upload');
      }
      const uri = await upLoadFile({
        biz: 'store',
        file: fileInstance,
        fileType: 'image',
        getUploadAuthToken: async () => {
          const { data } = await ProductApi.PublicGetImageUploadToken();
          return {
            data: {
              service_id: data?.service_id || '',
              upload_host: data?.upload_host || '',
              auth: {
                current_time: data?.current_time || '',
                expired_time: data?.expired_time || '',
                session_token: data?.session_token || '',
                access_key_id: data?.access_key_id || '',
                secret_access_key: data?.secret_access_key || '',
              },
            },
          };
        },
        getProgress: progress => {
          onProgress({ total: fileInstance.size, loaded: progress });
        },
      });
      const res = await ProductApi.PublicGetImageURL({ uri });
      onSuccess({ uri, url: res.data?.url });
    } catch (e) {
      if (e instanceof AxiosError) {
        onError(e.request);
      } else {
        onError({});
      }
    }
  };
