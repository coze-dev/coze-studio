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

import { EventEmitter } from 'eventemitter3';
import {
  getUploader,
  type CozeUploader,
  type Config,
} from '@coze-studio/uploader-adapter';
import { safeAsyncThrow } from '@coze-common/chat-area-utils';

import { requestInstance } from '../../request-manager';
import {
  type UploadPluginProps,
  type EventPayloadMaps,
  type FileType,
  type UploadPluginInterface,
  type GetUploadAuthTokenData,
} from './types/plugin-upload';

const GET_AUTH_URL = '/api/playground/upload/auth_token';

type ChatCoreUploadPluginProps = Config & UploadPluginProps;

export class ChatCoreUploadPlugin implements UploadPluginInterface {
  private uploader: CozeUploader | null = null;

  private eventBus = new EventEmitter();

  private dataAuth: GetUploadAuthTokenData = {};

  private uploaderConfig: ChatCoreUploadPluginProps;

  constructor(props: ChatCoreUploadPluginProps) {
    this.uploaderConfig = props;
    this.initUploader();
  }

  private async initUploader() {
    try {
      const dataAuth = await requestInstance.post(GET_AUTH_URL, {
        data: {
          // TODO: Confirm whether the parameter should support the incoming configuration
          scene: 'bot_task',
        },
      });
      this.dataAuth = dataAuth.data || {};
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { service_id, upload_host, schema } = (this.dataAuth || {}) as any;
      this.uploader = getUploader(
        {
          schema,
          useFileExtension: true,
          // cp-disable-next-line
          imageHost: `https://${upload_host}`, //imageX upload required
          imageConfig: {
            serviceId: service_id || '', // The service id applied for in the video cloud.
          },
          objectConfig: {
            serviceId: service_id || '',
          },
          ...this.uploaderConfig,
        },
        IS_OVERSEA,
      );

      this.addFile(this.uploaderConfig.file, this.uploaderConfig.type);
      this.uploader.on('complete', info => {
        this.eventBus.emit('complete', info);
      });
      this.uploader.on('progress', info => {
        this.eventBus.emit('progress', info);
      });
      this.uploader.on('error', info => {
        this.eventBus.emit('error', info);
      });
      this.uploader.on('complete', info => {
        this.eventBus.emit('complete', info);
      });
      this.uploader.start();
    } catch (e) {
      safeAsyncThrow(
        `upload-plugin error: ${e instanceof Error ? e.message : String(e)}`,
      );
    }
  }

  private addFile(file: File, type: FileType) {
    this.uploader?.addFile({
      file,
      stsToken: {
        CurrentTime: this.dataAuth?.auth?.current_time || '',
        ExpiredTime: this.dataAuth?.auth?.expired_time || '',
        SessionToken: this.dataAuth?.auth?.session_token || '',
        AccessKeyId: this.dataAuth?.auth?.access_key_id || '',
        SecretAccessKey: this.dataAuth?.auth?.secret_access_key || '',
      },
      type,
    });
  }

  on<T extends keyof EventPayloadMaps>(
    eventName: T,
    callback: (info: EventPayloadMaps[T]) => void,
  ) {
    this.eventBus.on(eventName, callback);
  }

  pause() {
    this.uploader?.pause();
    return;
  }
  cancel() {
    this.uploader?.cancel();
  }
}
