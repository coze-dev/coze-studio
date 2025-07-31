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

/**
 * 1. Responsible for standardizing imported parameters exported parameters of various types of message creation to reduce message creation costs
 * 2. For the received message, spit out the specified message format for different message types
 */

import { nanoid } from 'nanoid';
import { cloneDeep, merge } from 'lodash-es';

import {
  ContentType,
  type CreateMessageOptions,
  type ImageMessageProps,
  type Message,
  type MessageContent,
  type MixMessageContent,
  type NormalizedMessageProps,
  PreSendLocalMessageEventsEnum,
  type SendMessage,
  type SendMessageOptions,
  type TextAndFileMixMessageProps,
  type TextAndFileMixMessagePropsPayload,
  type TextMessageProps,
} from '../types';
import { filterEmptyField } from '../../shared/utils/data-handler';
import { FileTypeEnum, getFileInfo } from '../../shared/const';
import {
  type EventPayloadMaps,
  type UploadPluginConstructor,
  type UploadPluginInterface,
  type UploadResult,
} from '../../plugins/upload-plugin/types/plugin-upload';
import { ChatCoreError } from '../../custom-error';
import { type Scene } from '../../chat-sdk/types/interface';
import { type PreSendLocalMessageEventsManager } from './presend-local-message-events-manager';
import { PreSendLocalMessage } from './presend-local-message';

/**
 * Create a pre-sent message
 */
export interface PreSendLocalMessageFactoryProps {
  bot_id?: string;
  preset_bot?: string;
  conversation_id: string;
  user?: string;
  enableDebug?: false;
  scene?: Scene;
  bot_version?: string;
  draft_mode?: boolean;
}

export class PreSendLocalMessageFactory {
  bot_id?: string;

  preset_bot?: string;

  conversation_id: string;

  user?: string;

  scene?: Scene;

  bot_version?: string;

  draft_mode?: boolean;

  constructor(props: PreSendLocalMessageFactoryProps) {
    const {
      bot_id,
      conversation_id,
      preset_bot,
      user,
      scene,
      bot_version,
      draft_mode,
    } = props;
    this.bot_id = bot_id;
    this.preset_bot = preset_bot;
    this.conversation_id = conversation_id;
    this.user = user;
    this.scene = scene;
    this.bot_version = bot_version;
    this.draft_mode = draft_mode;
  }

  /**
   * Create text message
   */
  createTextMessage(
    props: TextMessageProps,
    messageEventsManager: PreSendLocalMessageEventsManager,
    options?: CreateMessageOptions,
  ): Message<ContentType.Text> {
    const { payload } = props;
    const message = PreSendLocalMessage.create<ContentType.Text>(
      this.assembleMessageCommonProps({
        content: payload.text,
        content_obj: payload.text,
        content_type: ContentType.Text,
        section_id: options?.section_id || '',
        mention_list: props.payload.mention_list,
      }),
    );
    messageEventsManager.add(message);
    return cloneDeep(message);
  }

  /**
   * Create image message
   */
  createImageMessage<M extends EventPayloadMaps>(props: {
    messageProps: ImageMessageProps<M>;

    UploadPlugin: UploadPluginConstructor;
    uploadPluginConstructorOptions: Record<string, unknown>;
    messageEventsManager: PreSendLocalMessageEventsManager;
    options?: CreateMessageOptions;
  }): PreSendLocalMessage<ContentType.Image> {
    const {
      payload: { file, mention_list },
      pluginUploadManager,
    } = props.messageProps;
    const {
      UploadPlugin,
      messageEventsManager,
      options,
      uploadPluginConstructorOptions,
    } = props;
    const message = PreSendLocalMessage.create(
      this.assembleMessageCommonProps<ContentType.Image>({
        content: JSON.stringify(this.assembleImageMessageContent(file)),
        content_obj: this.assembleImageMessageContent(file),
        content_type: ContentType.Image,
        section_id: options?.section_id || '',
        mention_list,
      }),
    );

    // Pre-sent messages are saved locally
    messageEventsManager.add(message);

    const uploaderPluginInstance = new UploadPlugin({
      file,
      type: 'image',
      ...uploadPluginConstructorOptions,
    }) as UploadPluginInterface<M>;

    pluginUploadManager?.(uploaderPluginInstance);

    uploaderPluginInstance.on('complete', info => {
      this.updateImageMessageContent(message, info.uploadResult);
      this.updateMessageUploadResult(message, 'success');
      messageEventsManager.emit(
        PreSendLocalMessageEventsEnum.FILE_UPLOAD_STATUS_CHANGE,
        message,
      );
    });

    uploaderPluginInstance.on('error', () => {
      this.updateMessageUploadResult(message, 'fail');
    });

    return cloneDeep(message);
  }

  /**
   * Create file message
   */
  createFileMessage<M extends EventPayloadMaps>(props: {
    messageProps: ImageMessageProps<M>;

    UploadPlugin: UploadPluginConstructor;
    uploadPluginConstructorOptions: Record<string, unknown>;
    messageEventsManager: PreSendLocalMessageEventsManager;
    options?: CreateMessageOptions;
  }): PreSendLocalMessage<ContentType.File> {
    const {
      payload: { file, mention_list },
      pluginUploadManager,
    } = props.messageProps;
    const {
      UploadPlugin,
      messageEventsManager,
      options,
      uploadPluginConstructorOptions,
    } = props;
    const message = PreSendLocalMessage.create(
      this.assembleMessageCommonProps<ContentType.File>({
        content: JSON.stringify(this.assembleFileMessageContent(file)),
        content_obj: this.assembleFileMessageContent(file),
        content_type: ContentType.File,
        section_id: options?.section_id || '',
        mention_list,
      }),
    );
    // Pre-send file messages saved locally
    messageEventsManager.add(message);

    const uploaderPluginInstance = new UploadPlugin({
      file,
      type: 'object',
      ...uploadPluginConstructorOptions,
    }) as UploadPluginInterface<M>;
    pluginUploadManager?.(uploaderPluginInstance);

    uploaderPluginInstance.on('complete', info => {
      const { uploadResult, type } = info;
      if (type === 'success') {
        this.updateFileMessageContent(message, uploadResult);
        this.updateMessageUploadResult(message, 'success');
        messageEventsManager.emit(
          PreSendLocalMessageEventsEnum.FILE_UPLOAD_STATUS_CHANGE,
          message,
        );
      }
    });

    uploaderPluginInstance.on('error', () => {
      this.updateMessageUploadResult(message, 'fail');
      messageEventsManager.emit(
        PreSendLocalMessageEventsEnum.FILE_UPLOAD_STATUS_CHANGE,
        message,
      );
    });
    return cloneDeep(message);
  }

  /**
   * Create a mixed message
   */
  createTextAndFileMixMessage(
    props: TextAndFileMixMessageProps,
    messageEventsManager: PreSendLocalMessageEventsManager,
    options?: CreateMessageOptions,
  ): Message<ContentType.Mix> {
    const {
      payload: { mixList, mention_list },
    } = props;
    const message = PreSendLocalMessage.create(
      this.assembleMessageCommonProps<ContentType.Mix>({
        content: JSON.stringify(
          this.assembleTextAndFileMixMessageContent(mixList),
        ),
        content_obj: this.assembleTextAndFileMixMessageContent(mixList),
        content_type: ContentType.Mix,
        section_id: options?.section_id || '',
        mention_list,
      }),
    );
    messageEventsManager.add(message);
    return cloneDeep(message);
  }

  /**
   * Create standardized messages
   */
  createNormalizedMessage<T extends ContentType>(
    props: NormalizedMessageProps<T>,
    messageEventsManager: PreSendLocalMessageEventsManager,
    options?: CreateMessageOptions,
  ): Message<T> {
    const {
      payload: { contentObj, contentType, mention_list },
    } = props;
    const message = PreSendLocalMessage.create(
      this.assembleMessageCommonProps({
        content: JSON.stringify(contentObj),
        content_obj: contentObj,
        content_type: contentType,
        section_id: options?.section_id || '',
        mention_list,
        file_upload_result: 'success',
      }),
    );
    messageEventsManager.add(message);
    return cloneDeep(message);
  }

  /**
   * Assemble image message content
   */
  private assembleImageMessageContent(
    file: File,
  ): MessageContent<ContentType.Image> {
    const blobUrl = URL.createObjectURL(file);
    return {
      image_list: [
        {
          key: '',
          image_thumb: {
            url: blobUrl,
            width: 0,
            height: 0,
          },
          image_ori: {
            url: blobUrl,
            width: 0,
            height: 0,
          },
          feedback: null,
        },
      ],
    };
  }

  /**
   * Update image message content
   */
  private updateImageMessageContent(
    message: PreSendLocalMessage<ContentType.Image>,
    uploadResult: UploadResult,
  ): void {
    const {
      Uri = '',
      Url = '',
      ImageWidth = 0,
      ImageHeight = 0,
    } = uploadResult;
    message.content_obj.image_list[0] = {
      ...message.content_obj.image_list[0],
      key: Uri,
      image_thumb: {
        ...message.content_obj.image_list[0].image_thumb,
        width: ImageWidth,
        height: ImageHeight,
        url: Url,
      },
      image_ori: {
        ...message.content_obj.image_list[0].image_ori,
        width: ImageWidth,
        height: ImageHeight,
        url: Url,
      },
    };

    message.content = JSON.stringify(message.content_obj);
  }

  /**
   * Update file message content
   */
  private updateFileMessageContent(
    message: PreSendLocalMessage<ContentType.File>,
    uploadResult: UploadResult,
  ): void {
    const { Uri = '', Url = '' } = uploadResult;
    message.content_obj.file_list[0].file_key = Uri;
    message.content_obj.file_list[0].file_url = Url;
    message.content = JSON.stringify(message.content_obj);
  }

  /**
   * Update image/file message Upload status: success | failed
   */
  private updateMessageUploadResult(
    message: PreSendLocalMessage<ContentType.Image | ContentType.File>,
    status: 'success' | 'fail',
  ) {
    message.file_upload_result = status;
    return message;
  }

  /**
   * Assemble file message content
   */
  private assembleFileMessageContent(
    file: File,
  ): MessageContent<ContentType.File> {
    const fileType = getFileInfo(file)?.fileType;
    if (!fileType) {
      throw new ChatCoreError('文件类型不支持');
    }
    return {
      file_list: [
        {
          file_key: '',
          file_name: file.name,
          file_type: fileType,
          file_size: file.size,
          file_url: '',
        },
      ],
    };
  }

  /**
   * Assemble mixed message content
   */
  private assembleTextAndFileMixMessageContent(
    mixList: TextAndFileMixMessagePropsPayload['mixList'],
  ): MessageContent<ContentType.Mix> {
    const itemList = mixList.map(item => {
      const { type } = item;
      if (type === ContentType.Text) {
        return {
          type,
          text: item.text,
        };
      }
      if (type === ContentType.File) {
        const fileType =
          getFileInfo(item.file)?.fileType || FileTypeEnum.DEFAULT_UNKNOWN;

        return {
          type,
          file: {
            file_key: item.uri,
            file_name: item.file.name,
            file_type: fileType,
            file_size: item.file.size,
            file_url: '',
          },
        };
      }
      if (type === ContentType.Image) {
        const blobUrl = URL.createObjectURL(item.file);

        return {
          type,
          image: {
            key: item.uri,
            image_thumb: {
              url: blobUrl,
              width: item.width,
              height: item.height,
            },
            image_ori: {
              url: blobUrl,
              width: item.width,
              height: item.height,
            },
            feedback: null,
          },
        };
      }
    });
    return {
      item_list: itemList as MixMessageContent['item_list'],
    };
  }

  /**
   * Assembly message common field
   */
  private assembleMessageCommonProps<T extends ContentType>(
    props: Pick<
      PreSendLocalMessage<T>,
      | 'content'
      | 'content_type'
      | 'section_id'
      | 'content_obj'
      | 'mention_list'
      | 'file_upload_result'
    >,
  ): Message<T> {
    const commonProps: Pick<
      Message<T>,
      'message_id' | 'reply_id' | 'is_finish' | 'extra_info' | 'role' | 'type'
    > = {
      message_id: '',
      reply_id: '',
      is_finish: true,
      // TODO: fix me
      // @ts-expect-error should be fixed
      extra_info: {
        local_message_id: nanoid(),
        input_tokens: '', // User query consumed token
        output_tokens: '', // LLM output consumed token
        token: '', // Total token consumption
        plugin_status: 'success', // "success" or "fail"
        time_cost: '', // Intermediate invocation time of procedure
        workflow_tokens: '',
        bot_state: '', // {   bot_id?: string;agent_id?: string;agent_name?: string; }
        plugin_request: '', // Parameters of the plugin request
        tool_name: '', // Specific API name under the invoked plugin
        plugin: '', // Name of the plugin invoked
      },
      role: 'user',
      type: 'question',
    };
    return merge(
      commonProps,
      this.bot_id ? { bot_id: this.bot_id } : {},
      this.preset_bot ? { preset_bot: this.preset_bot } : {},
      this.user ? { user: this.user } : {},
      this.scene ? { scene: this.scene } : {},
      props,
    );
  }

  /**
   * Process the message structure sent to the server
   */
  getSendMessageStructure(
    message: PreSendLocalMessage<ContentType>,
    options: SendMessageOptions,
  ): SendMessage {
    const {
      extra_info: { local_message_id },
      content_type,
      content,
      message_id,
      mention_list,
    } = message;
    const { user, bot_id, preset_bot, scene, bot_version, draft_mode } = this;
    const { stream, chatHistory, isRegenMessage, extendFiled } = options;
    const mergedStructure = merge(
      {
        bot_id,
        preset_bot,
        conversation_id: this.conversation_id,
        local_message_id,
        content_type,
        query: content,
        user,
        extra: {},
        scene,
        bot_version,
        draft_mode,
        stream,
        chat_history: chatHistory,
        regen_message_id: isRegenMessage ? message_id : undefined,
        mention_list,
      },
      extendFiled,
    );
    return filterEmptyField(mergedStructure);
  }
}
