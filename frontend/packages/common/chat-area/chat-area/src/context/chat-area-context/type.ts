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
  /** hasMore指导前继数据，nextHasMore指导后继数据 */
  next_has_more?: boolean;
  /** cursor指导向前翻页，nextCursor指导向后翻页 */
  next_cursor: string | undefined;
  /** 当前读取到的message_index */
  read_message_index?: string;
  backgroundInfo?: BackgroundImageInfo;
}

/**
 * 目前都是来自 verbose 的子类型；
 * 影响深远，慎重调整
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

// TODO: 感觉preference需要赶紧与configs合并，否则初始化的地方拿不到数据（provider外）
export interface ChatAreaConfigs {
  ignoreMessageConfigList: IgnoreMessageType[];
  showFunctionCallDetail: boolean;
  // 是否group用户消息（合并头像）
  groupUserMessage: boolean;
  uploadPlugin: typeof UploadPlugin;
}

export type CreateChatCoreOverrideConfig = Partial<
  Omit<CreateChatCoreProps, 'bot_version' | 'bot_id' | 'conversation_id'>
>;

export type ExtendDataLifecycle = 'disable' | 'full-site';

export interface ChatAreaProviderProps
  extends Partial<ProviderPassThroughPreference> {
  // botId presetBot 必须提供其一, 加了运行时检查
  botId?: string;
  spaceId?: string;
  presetBot?: PresetBot;
  scene: Scene;
  userInfo: UserSenderInfo | null;
  reporter: Reporter;
  botVersion?: string;
  requestToInit: () => Promise<MixInitResponse>;
  /**
   * @deprecated 废弃了，请使用插件化方案
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
   * @deprecated 不好。后续新增配置参考 ProviderPassThroughPreference
   */
  configs?: Partial<ChatAreaConfigs>;
  /** 是否延长数据生命周期，以超出 provider 自身限制 */
  extendDataLifecycle?: ExtendDataLifecycle;
  enableChatCoreDebug?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  pluginRegistryList?: RegisterPlugin<any>[];
  /**
   * @deprecated 后续下线该参数，不应该随意使用
   */
  enableInitServiceRefactor?: boolean;
  /**
   * 自定义停止回复按钮的等待状态
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
  /** !!!给 coze home 开的后门，不要用!!! */
  updateSenderInfo: UpdateBotInfoByImmer;
  /**
   * !!!又加了一个后门我快不行了
   */
  updateWaitingSenderId: (id: WaitingSenderId) => void;
  // 给bot store加的后门
  /**
   * @deprecated 废弃，后续禁止使用
   */
  refreshMessageList: () => void;
}
