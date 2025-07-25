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
 
import { SdkEventsEnum } from '../events/sdk-events';
import { type DeployVersion, type ENV } from '../../shared/const';
import { type RequestManagerOptions } from '../../request-manager/types';
import { type UploadPluginConstructor } from '../../plugins/upload-plugin/types/plugin-upload';
import type { Message, ImageMessageProps } from '../../message/types';
export type {
  GetHistoryMessageProps,
  ClearHistoryProps,
  DeleteMessageProps,
  BreakMessageProps,
} from '../../message/types/message-manager';
import { ContentType } from '../../message/types';
import { type ChatCoreError } from '../../custom-error';
import type { TokenManager } from '../../credential';

export { Message, ContentType, ImageMessageProps };

export { SdkEventsEnum };

export type BotUnique =
  | {
      bot_id: string;
    }
  | {
      /**
       * 使用的bot模版 代替bot_id bot_version draft_mode参数
       * 非安全考虑，仅不想暴露bot_id的情况下使用
       * botId、presetBot必传其一
       */
      preset_bot: PresetBot;
    };

export const isPresetBotUnique = <T extends BotUnique>(
  sth: T,
): sth is { preset_bot: PresetBot } & Exclude<T, 'bot_id'> =>
  'preset_bot' in sth && !!sth.preset_bot;

export type CreateProps = BotUnique & {
  /**
   * 用于计算资源点消耗
   */
  space_id?: string;
  /**
   * 业务方标识，用于埋点记录
   */
  biz: Biz;
  /**
   * bot 版本号
   */
  bot_version?: string;

  /**
   *  草稿bot or 线上bot,
   */
  draft_mode?: boolean;

  /**
   * 会话 id
   */
  conversation_id: string;

  /**
   * 指定发送的唯一用户
   */
  user?: string;

  /**
   * 场景值,主要用于服务端鉴权, 默认 0 default
   */
  scene?: Scene;

  /**
   * 环境变量，区分测试环境和线上环境
   * 用于日志上报
   */
  env: ENV;

  /**
   * 区分部署版本
   */

  deployVersion: DeployVersion;

  /**
   * 是否开启 debug模式，目前主要给 bot editor 使用
   * 开启后，每条回复消息新增debug_messages字段，包含channel 吐出的所有 chunk消息
   **/
  enableDebug?: boolean;
  /**
   * sdk 控制台日志等级，默认error, 后面层级会包含前面层级
   **/
  logLevel?: LogLevel;
  /**
   接口拦截器
   **/
  requestManagerOptions?: RequestManagerOptions;

  /**
   * token 刷新机制
   */
  tokenManager?: TokenManager;
};

export type LogLevel = 'disable' | 'info' | 'error';

export interface SdkMessageEvent {
  name: SdkEventsEnum;
  data: Message<ContentType>[];
}

export interface SdkErrorEvent {
  name: SdkEventsEnum;
  data: {
    error: Error;
  };
}
export type PullingStatus =
  | 'start'
  | 'pulling'
  | 'answerEnd'
  | 'success'
  | 'error'
  | 'timeout';

export interface SdkPullingStatusEvent {
  name: SdkEventsEnum;
  data: {
    /**
     * 拉取回复消息状态
     */
    pullingStatus: PullingStatus;
    /**
     * query 的本地 id
     */
    local_message_id: string;
    /**
     * query 的服务端 message_id
     */
    reply_id: string;
  };

  error?: ChatCoreError;

  /**
   * timeout 状态下返回，用于终止拉取
   * @returns
   */
  abort?: () => void;
}

export interface SdkEventsCallbackMap {
  [SdkEventsEnum.MESSAGE_RECEIVED_AND_UPDATE]: (event: SdkMessageEvent) => void;
  [SdkEventsEnum.ERROR]: (event: SdkErrorEvent) => void;
  [SdkEventsEnum.MESSAGE_PULLING_STATUS]: (
    event: SdkPullingStatusEvent,
  ) => void;
}

export type PluginKey = 'upload-plugin';

export type PluginValue<
  T,
  P extends Record<string, unknown>,
> = T extends 'upload-plugin' ? UploadPluginConstructor<P> : never;

/**
 * 接入的业务方向
 * 目前采用枚举接入，控制接入方向
 * third_part给open_api sdk使用，暴露给第三方
 */
export type Biz = 'coze_home' | 'bot_editor' | 'third_part';

export type PresetBot = 'coze_home' | 'prompt_optimize' | '';

/**
 * 接口也有这个定义 enum Scene.
 * 注意前端定义与接口完全对齐:
 * src/auto-generate/developer_api/namespaces/developer_api.ts
 */
export const enum Scene {
  Default = 0,
  Explore = 1,
  BotStore = 2,
  CozeHome = 3,
  // 调试区 命名和服务端对齐的
  Playground = 4,
  AgentAPP = 6,
  PromptOptimize = 7,
  /**
   * TODO: 前端单独增加，需要和后端对齐固定一个枚举
   */
  OpenAipSdk = 1000,
}

/**
 * 对齐 developer_api/namespaces/developer_api.ts
 */
export const enum LoadDirection {
  Unknown = 0,
  Prev = 1,
  Next = 2,
}
