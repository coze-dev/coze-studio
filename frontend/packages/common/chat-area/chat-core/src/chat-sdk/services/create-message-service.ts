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

import { type ReportLog } from '@/report-log';
import type { EventPayloadMaps } from '@/plugins/upload-plugin/types/plugin-upload';
import type {
  ContentType,
  CreateMessageOptions,
  FileMessageProps,
  ImageMessageProps,
  Message,
  NormalizedMessageProps,
  TextAndFileMixMessageProps,
  TextMessageProps,
} from '@/message/types';
import { type PreSendLocalMessageEventsManager } from '@/message/presend-local-message/presend-local-message-events-manager';
import { type PreSendLocalMessageFactory } from '@/message';

import { type PluginsService } from './plugins-service';

export interface CreateMessageServicesProps {
  preSendLocalMessageFactory: PreSendLocalMessageFactory;
  preSendLocalMessageEventsManager: PreSendLocalMessageEventsManager;
  reportLogWithScope: ReportLog;
  pluginsService: PluginsService;
}

export class CreateMessageService {
  preSendLocalMessageFactory: PreSendLocalMessageFactory;
  preSendLocalMessageEventsManager: PreSendLocalMessageEventsManager;
  reportLogWithScope: ReportLog;
  pluginsService: PluginsService;
  constructor({
    preSendLocalMessageFactory,
    preSendLocalMessageEventsManager,
    reportLogWithScope,
    pluginsService,
  }: CreateMessageServicesProps) {
    this.preSendLocalMessageFactory = preSendLocalMessageFactory;
    this.preSendLocalMessageEventsManager = preSendLocalMessageEventsManager;
    this.reportLogWithScope = reportLogWithScope;
    this.pluginsService = pluginsService;
  }

  /**
   * Create text message
   */
  createTextMessage(
    props: TextMessageProps,
    options?: CreateMessageOptions,
  ): Message<ContentType.Text> {
    return this.preSendLocalMessageFactory.createTextMessage(
      props,
      this.preSendLocalMessageEventsManager,
      options,
    );
  }

  /**
   * Create image message
   */
  createImageMessage<M extends EventPayloadMaps = EventPayloadMaps>(
    props: ImageMessageProps<M>,
    options?: CreateMessageOptions,
  ): Message<ContentType.Image> {
    const { UploadPlugin, uploadPluginConstructorOptions } =
      this.pluginsService;
    if (!UploadPlugin) {
      this.reportLogWithScope.info({
        message: '请先注册上传插件',
      });
      throw new Error('请先注册上传插件');
    }
    return this.preSendLocalMessageFactory.createImageMessage({
      messageProps: props,
      UploadPlugin,
      uploadPluginConstructorOptions,
      messageEventsManager: this.preSendLocalMessageEventsManager,
      options,
    });
  }

  /**
   * Create file message
   */
  createFileMessage<M extends EventPayloadMaps = EventPayloadMaps>(
    props: FileMessageProps<M>,
    options?: CreateMessageOptions,
  ): Message<ContentType.File> {
    const { UploadPlugin, uploadPluginConstructorOptions } =
      this.pluginsService;
    if (!UploadPlugin) {
      this.reportLogWithScope.info({
        message: '请先注册上传插件',
      });
      throw new Error('请先注册上传插件');
    }
    return this.preSendLocalMessageFactory.createFileMessage({
      messageProps: props,
      UploadPlugin,
      uploadPluginConstructorOptions,
      messageEventsManager: this.preSendLocalMessageEventsManager,
      options,
    });
  }

  /**
   * Create a mixed message
   */
  createTextAndFileMixMessage(
    props: TextAndFileMixMessageProps,
    options?: CreateMessageOptions,
  ): Message<ContentType.Mix> {
    return this.preSendLocalMessageFactory.createTextAndFileMixMessage(
      props,
      this.preSendLocalMessageEventsManager,
      options,
    );
  }

  /**
   * Create standardized messages, messages with payload content structure already processed
   */
  createNormalizedPayloadMessage<T extends ContentType>(
    props: NormalizedMessageProps<T>,
    options?: CreateMessageOptions,
  ): Message<T> {
    return this.preSendLocalMessageFactory.createNormalizedMessage<T>(
      props,
      this.preSendLocalMessageEventsManager,
      options,
    );
  }
}
