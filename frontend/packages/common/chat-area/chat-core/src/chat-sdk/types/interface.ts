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
       * Use the bot template instead of bot_id bot_version draft_mode parameters
       * For non-safety reasons, use only if you don't want to expose bot_id
       * botId, presetBot must pass one
       */
      preset_bot: PresetBot;
    };

export const isPresetBotUnique = <T extends BotUnique>(
  sth: T,
): sth is { preset_bot: PresetBot } & Exclude<T, 'bot_id'> =>
  'preset_bot' in sth && !!sth.preset_bot;

export type CreateProps = BotUnique & {
  /**
   * For computing resource point consumption
   */
  space_id?: string;
  /**
   * Business party ID for event tracking
   */
  biz: Biz;
  /**
   * bot version number
   */
  bot_version?: string;

  /**
   *  Draft bots or online bots,
   */
  draft_mode?: boolean;

  /**
   * session id
   */
  conversation_id: string;

  /**
   * Specify the unique user to send
   */
  user?: string;

  /**
   * Scene value, mainly used for server level authentication, default 0 default
   */
  scene?: Scene;

  /**
   * Environment variables to distinguish between testing environment and online environment
   * For log reporting
   */
  env: ENV;

  /**
   * Differentiate deployment versions
   */

  deployVersion: DeployVersion;

  /**
   * Whether to enable debug mode, currently mainly used by the bot editor
   * After opening, each reply message adds debug_messages field, including all chunk messages spat out by the channel
   **/
  enableDebug?: boolean;
  /**
   * SDK console log level, default error, the following level will contain the previous level
   **/
  logLevel?: LogLevel;
  /**
   Interface blocker
   **/
  requestManagerOptions?: RequestManagerOptions;

  /**
   * Token refresh mechanism
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
     * Pull reply message status
     */
    pullingStatus: PullingStatus;
    /**
     * Local ID of the query
     */
    local_message_id: string;
    /**
     * The server level of the query message_id
     */
    reply_id: string;
  };

  error?: ChatCoreError;

  /**
   * Returns in timeout state to terminate the pull
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
 * Access business direction
 * Currently, enumeration access is used to control the access direction
 * third_part used by open_api SDK, exposed to third parties
 */
export type Biz = 'coze_home' | 'bot_editor' | 'third_part';

export type PresetBot = 'coze_home' | 'prompt_optimize' | '';

/**
 * Interfaces also have this definition enum Scene.
 * Note that the front-end definition is fully aligned with the interface.
 * src/auto-generate/developer_api/namespaces/developer_api.ts
 */
export const enum Scene {
  Default = 0,
  Explore = 1,
  BotStore = 2,
  CozeHome = 3,
  // Debug area, named and server level aligned
  Playground = 4,
  AgentAPP = 6,
  PromptOptimize = 7,
  /**
   * TODO: The front end is increased separately, and an enumeration needs to be aligned with the back end.
   */
  OpenAipSdk = 1000,
}

/**
 * Align developer_api/namespaces/developer_api
 */
export const enum LoadDirection {
  Unknown = 0,
  Prev = 1,
  Next = 2,
}
