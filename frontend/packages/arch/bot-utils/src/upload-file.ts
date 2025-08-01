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

/* eslint-disable @typescript-eslint/naming-convention */
import { userStoreService } from '@coze-studio/user-store';
import {
  getUploader as initUploader,
  type CozeUploader,
  type Config as BytedUploaderConfig,
} from '@coze-studio/uploader-adapter';
import { type developer_api } from '@coze-arch/bot-api/developer_api';
import { DeveloperApi, workflowApi } from '@coze-arch/bot-api';

export type BytedUploader = CozeUploader;

interface Inform {
  uploadResult: {
    Uri: string;
  };
  extra: string;
  percent?: number;
}

type BizConfig = Record<
  string,
  {
    getAuthToken: () => Promise<{
      serviceId: string;
      uploadHost: string;
      stsToken: BytedUploaderConfig['stsToken'];
      schema: string;
    }>;
  }
>;

const bizConfig: BizConfig = {
  bot: {
    getAuthToken: async () => {
      const dataAuth = await DeveloperApi.GetUploadAuthToken({
        scene: 'bot_task',
      });
      const dataAuthnr = dataAuth.data;
      const { service_id, upload_host, auth, schema } = (dataAuthnr ||
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        {}) as any;

      return {
        schema,
        serviceId: service_id || '',
        uploadHost: upload_host || '',
        stsToken: {
          CurrentTime: auth?.current_time || '',
          ExpiredTime: auth?.expired_time || '',
          SessionToken: auth?.session_token || '',
          AccessKeyId: auth?.access_key_id || '',
          SecretAccessKey: auth?.secret_access_key || '',
        },
      };
    },
  },
  workflow: {
    getAuthToken: async () => {
      const dataAuth = await workflowApi.GetUploadAuthToken({
        scene: 'imageflow',
      });
      const dataAuthnr = dataAuth.data;

      const { service_id, upload_host, auth, schema } = (dataAuthnr ||
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        {}) as any;

      return {
        schema,
        serviceId: service_id || '',
        uploadHost: upload_host || '',
        stsToken: {
          CurrentTime: auth?.current_time || '',
          ExpiredTime: auth?.expired_time || '',
          SessionToken: auth?.session_token || '',
          AccessKeyId: auth?.access_key_id || '',
          SecretAccessKey: auth?.secret_access_key || '',
        },
      };
    },
  },
};

export function upLoadFile({
  biz = 'bot',
  file,
  fileType = 'image',
  getProgress,
  getUploader,
  getUploadAuthToken,
}: {
  /** Business, different businesses correspond to different ImageX services */
  biz?: 'bot' | 'workflow' | string;
  file: File;
  fileType?: 'image' | 'object';
  getProgress?: (progress: number) => void;
  getUploader?: (uploader: BytedUploader) => void;
  // The business party obtains the upload token by itself
  getUploadAuthToken?: () => Promise<developer_api.GetUploadAuthTokenResponse>;
}) {
  const config = bizConfig[biz];
  if (!config && !getUploadAuthToken) {
    throw new Error('upLoadFile need biz');
  }
  const result = new Promise<string>((resolve, reject) => {
    // eslint-disable-next-line complexity
    (async function () {
      try {
        let serviceId, uploadHost, stsToken, schema;
        if (config) {
          const data = await config.getAuthToken();
          serviceId = data.serviceId;
          uploadHost = data.uploadHost;
          stsToken = data.stsToken;
          schema = data.schema;
        } else if (getUploadAuthToken) {
          const { data } = await getUploadAuthToken();
          // @ts-expect-error -- linter-disable-autofix
          serviceId = data.service_id;
          // @ts-expect-error -- linter-disable-autofix
          uploadHost = data.upload_host;
          // @ts-expect-error -- linter-disable-autofix
          schema = data.schema;
          // cp-disable-next-line
          if (uploadHost.startsWith('https://')) {
            uploadHost = uploadHost.substr(8);
          }
          stsToken = {
            // @ts-expect-error -- linter-disable-autofix
            CurrentTime: data.auth?.current_time || '',
            // @ts-expect-error -- linter-disable-autofix
            ExpiredTime: data.auth?.expired_time || '',
            // @ts-expect-error -- linter-disable-autofix
            SessionToken: data.auth?.session_token || '',
            // @ts-expect-error -- linter-disable-autofix
            AccessKeyId: data.auth?.access_key_id || '',
            // @ts-expect-error -- linter-disable-autofix
            SecretAccessKey: data.auth?.secret_access_key || '',
          };
        }

        const bytedUploader: BytedUploader = initUploader(
          {
            schema,
            useFileExtension: true,
            userId: userStoreService.getUserInfo()?.user_id_str || '',
            appId: APP_ID,
            // cp-disable-next-line
            imageHost: `https://${uploadHost}`, //imageX upload required
            imageConfig: {
              serviceId: serviceId || '', // The service id applied for in the video cloud.
            },
            objectConfig: {
              serviceId: serviceId || '',
            },
            imageFallbackHost: IMAGE_FALLBACK_HOST,
            region: BYTE_UPLOADER_REGION,
          },
          IS_OVERSEA,
        );
        getUploader?.(bytedUploader);
        bytedUploader.on('complete', inform => {
          const { uploadResult } = inform;
          resolve(uploadResult.Uri ?? '');
        });

        bytedUploader.on('error', inform => {
          const { extra } = inform;
          reject(extra);
        });

        if (getProgress) {
          bytedUploader.on('progress', inform => {
            const { percent } = inform as unknown as Inform;
            getProgress(percent || 0);
          });
        }

        const fileKey = bytedUploader.addFile({
          file,
          stsToken,
          type: fileType, // Upload file type, three optional values: video (video or audio, default), image (picture), object (normal file)
        });
        bytedUploader.start(fileKey);
      } catch (e) {
        reject(e);
      }
    })();
  });
  return result;
}
