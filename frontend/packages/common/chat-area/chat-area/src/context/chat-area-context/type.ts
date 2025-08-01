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

import { type Emitter } from 'mitt';
import {
  type CreateChatCoreProps,
  type Scene,
  type PresetBot,
  type SendMessageOptions,
} from '@coze-common/chat-core';
import { type Reporter } from '@coze-arch/logger';
import {
  type BackgroundImageInfo,
  type ChatMessage,
} from '@coze-arch/bot-api/developer_api';
import { type SendTextMessagePayload } from '@coze-common/chat-uikit-shared';

import { type ProviderPassThroughPreference } from '../preference/types';
import { type EventNames } from '../../utils/event-bus/uikit-event-bus';
import { type WaitingStore } from '../../store/waiting';
import {
  type Message,
  type OnboardingSuggestionItem,
  type SenderInfoMap,
  type UserInfoMap,
  type UserSenderInfo,
} from '../../store/types';
import { type SuggestionsStore } from '../../store/suggestions';
import {
  type UpdateBotInfoByImmer,
  type WaitingSenderId,
  type SenderInfoStore,
} from '../../store/sender-info';
import { type SelectionStore } from '../../store/selection';
import { type SectionIdStore } from '../../store/section-id';
import { type PluginStore } from '../../store/plugins';
import { type OnboardingStore } from '../../store/onboarding';
import { type MessagesStore } from '../../store/messages';
import { type MessageMetaStore } from '../../store/message-meta';
import { type MessageIndexStore } from '../../store/message-index';
import { type GlobalInitStore } from '../../store/global-init';
import { type FileStore } from '../../store/file';
import { type ChatActionStore } from '../../store/chat-action';
import { type BatchFileUploadStore } from '../../store/batch-upload-file';
import { type AudioUIStore } from '../../store/audio-ui';
import { type UploadPlugin } from '../../service/upload-plugin';
import { type RegisterPlugin } from '../../plugin/types/register-plugin';
import { type SystemLifeCycleService } from '../../plugin/life-cycle';
import {
  type SendMessageFrom,
  type ChatAreaEventCallback,
} from './chat-area-callback';

export interface MixInitResponse {
  conversationId: string | null;
  lastSectionId?: string;
  messageList?: ChatMessage[];
  cursor: string;
  hasMore: boolean;
  prologue?: string;
  onboardingSuggestions?: OnboardingSuggestionItem[];
  botVersion?: string;
  botInfoMap?: SenderInfoMap;
  userInfoMap?: UserInfoMap;
  /** hasMore guides predecessor data, nextHasMore guides successor data */
  next_has_more?: boolean;
  /** Cursor guides page forward, nextCursor guides page backward */
  next_cursor: string | undefined;
  /** Currently read message_index */
  read_message_index?: string;
  backgroundInfo?: BackgroundImageInfo;
}

/**
 * Currently all are subtypes from verbose;
 * Far-reaching impact, carefully adjusted
 */
export enum IgnoreMessageType {
  Knowledge,
  LongTermMemory,
  JumpToAgent,
  Backwards,
}

export const allIgnorableMessageTypes = [
  IgnoreMessageType.Knowledge,
  IgnoreMessageType.LongTermMemory,
  IgnoreMessageType.JumpToAgent,
  IgnoreMessageType.Backwards,
];

// TODO: I feel that preference needs to be merged with configs quickly, otherwise the data cannot be obtained at the initialization place (outside the provider)
export interface ChatAreaConfigs {
  ignoreMessageConfigList: IgnoreMessageType[];
  showFunctionCallDetail: boolean;
  // Whether to group user messages (merge avatars)
  groupUserMessage: boolean;
  uploadPlugin: typeof UploadPlugin;
}

export type CreateChatCoreOverrideConfig = Partial<
  Omit<CreateChatCoreProps, 'bot_version' | 'bot_id' | 'conversation_id'>
>;

export type ExtendDataLifecycle = 'disable' | 'full-site';

export interface ChatAreaProviderProps
  extends Partial<ProviderPassThroughPreference> {
  // botId presetBot must provide one, plus runtime check
  botId?: string;
  spaceId?: string;
  presetBot?: PresetBot;
  scene: Scene;
  userInfo: UserSenderInfo | null;
  reporter: Reporter;
  botVersion?: string;
  requestToInit: () => Promise<MixInitResponse>;
  /**
   * @Deprecated deprecated, please use plugin scheme
   */
  eventCallback?: ChatAreaEventCallback;
  /**
   * @default
   * {
   *  requestManagerOptions: { timeout: 12000 }
   * }
   */
  createChatCoreOverrideConfig?: CreateChatCoreOverrideConfig;
  /**
   * @Deprecated is not good. Subsequent new configuration reference ProviderPassThroughPreference
   */
  configs?: Partial<ChatAreaConfigs>;
  /** Whether to extend the data lifecycle beyond the provider's own limitations */
  extendDataLifecycle?: ExtendDataLifecycle;
  enableChatCoreDebug?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  pluginRegistryList?: RegisterPlugin<any>[];
  /**
   * @Deprecated This parameter should not be used at will
   */
  enableInitServiceRefactor?: boolean;
  /**
   * Customize the wait state of the stop reply button
   */
  stopRespondOverrideWaiting?: boolean;
}

export interface StoreSet {
  useGlobalInitStore: GlobalInitStore;
  useMessageMetaStore: MessageMetaStore;
  useMessagesStore: MessagesStore;
  useSectionIdStore: SectionIdStore;
  useWaitingStore: WaitingStore;
  useOnboardingStore: OnboardingStore;
  useFileStore: FileStore;
  useSuggestionsStore: SuggestionsStore;
  useSelectionStore: SelectionStore;
  useSenderInfoStore: SenderInfoStore;
  useBatchFileUploadStore: BatchFileUploadStore;
  usePluginStore: PluginStore;
  useMessageIndexStore: MessageIndexStore;
  useChatActionStore: ChatActionStore;
  useAudioUIStore: AudioUIStore;
}

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type EventCenter = {
  [EventNames.SEND_TEXT_MESSAGE]: SendTextMessagePayload & {
    clickLocation: SendMessageFrom;
    options?: SendMessageOptions;
  };
  [EventNames.UPDATE_CARD_STATUS]: {
    messageID: string;
    action: string;
  };
  [EventNames.RESEND_MESSAGE]: {
    message: Message;
  };
};

export interface ChatAreaContext
  extends Omit<
    ChatAreaProviderProps,
    | 'requestToInit'
    | 'manualInit'
    | 'userInfo'
    | 'pluginRegistryList'
    | 'configs'
    | ('extendDataLifecycle' | keyof ProviderPassThroughPreference)
  > {
  eventCenter: Emitter<EventCenter>;
  reporter: Reporter;
  lifeCycleService: SystemLifeCycleService;
  refreshMessageList: () => void;
  manualInit: () => void;
  configs: ChatAreaConfigs;
}

export interface ChatAreaProviderMethod {
  resetStateFullSite: () => void;
  /** !!! The back door to the coze home, don't use it!!! */
  updateSenderInfo: UpdateBotInfoByImmer;
  /**
   * !!! Added another back door and I'm dying
   */
  updateWaitingSenderId: (id: WaitingSenderId) => void;
  // Backdoor to the bot store
  /**
   * @deprecated, subsequent use is prohibited
   */
  refreshMessageList: () => void;
}
