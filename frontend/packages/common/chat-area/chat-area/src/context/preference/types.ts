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
 
import { type UiKitChatInputButtonConfig } from '@coze-common/chat-uikit';
import { type SuggestedQuestionsShowMode } from '@coze-arch/bot-api/developer_api';
import {
  type Layout,
  type UiKitChatInputButtonStatus,
} from '@coze-common/chat-uikit-shared';

export type NewMessageInterruptScenario = 'replying' | 'suggesting' | 'never';

export interface ProviderPassThroughPreference {
  /** 启用双向加载机制 */
  enableTwoWayLoad: boolean;
  /** 启用已读上报能力 */
  enableMarkRead: boolean;
  showUserExtendedInfo: boolean;
  /** 启用图片动态适应能力 */
  enableImageAutoSize: boolean;
  /**
   * 用于计算图片尺寸的宽度（手动传入，则采用手动传入的）
   */
  imageAutoSizeContainerWidth: number | undefined;
  /** 启动粘贴上传能力 */
  enablePasteUpload: boolean;
  /**
   * 输入框是否只读
   */
  isInputReadonly: boolean;
  /**
   * 开启拖拽上传
   */
  enableDragUpload: boolean;
  /** 启用用户交互锁能力 */
  enableChatActionLock?: boolean;
  /**
   * 开场白是否可选
   */
  enableSelectOnboarding: boolean;
  /**
   * 配置输入框中的按钮状态
   */
  uikitChatInputButtonStatus: Partial<UiKitChatInputButtonStatus>;
  /**
   * 开场白显示模式: wrap, random
   */
  onboardingSuggestionsShowMode: SuggestedQuestionsShowMode;
  /**
   * 背景图是否展示
   */
  showBackground: boolean;
  /**
   * 自定义停止回复按钮的等待状态
   */
  stopRespondOverrideWaiting: boolean | undefined;
}

/**
 * @deprecated NOTICE: 勿在此新增属性，后逐渐替换为 ProviderPassThroughPreference
 */
export interface PreferenceContextInterface {
  /**
   * 可打断并发送新会话场景
   * - replying: 发送后, 回复过程中可打断
   * - suggesting: 回复完成, 生成建议中可打断
   * - never: 不可打断
   */
  newMessageInterruptScenario: NewMessageInterruptScenario;
  /**
   * 是否启用Message Answer Actions功能
   */
  enableMessageBoxActionBar: boolean;
  /**
   * 是否开始选择模式
   */
  selectable: boolean;
  /**
   * 清除上下文是否显示清除线
   */
  showClearContextDivider: boolean;
  /**
   * 消息列表宽度
   */
  messageWidth: string;
  /**
   * 是否只读
   */
  readonly: boolean;
  /**
   *
   */
  uiKitChatInputButtonConfig: Partial<UiKitChatInputButtonConfig>;
  /**
   * UIKit 按钮状态
   * @deprecated -- 请用Provider中的该属性
   */
  uikitChatInputButtonStatus: Partial<UiKitChatInputButtonStatus>;
  /**
   * 主题样式
   */
  theme: 'debug' | 'store' | 'home';
  /**
   * 开启多模态上传模式
   * 用户可以上传文件展示到 Input 区域上方
   * 文件和文字可以同时发送
   */
  enableMultimodalUpload: boolean;
  /**
   * 用户上传文件后立即发送一条消息
   * 文件和文字不可以同时发送
   */
  enableLegacyUpload: boolean;
  /** 启动mention功能，目前为 coze home \@bot 使用 */
  enableMention: boolean;
  /** 最大可上传的文件数量 */
  fileLimit: number;
  /**
   * 是否展示Input区域
   */
  showInputArea: boolean;

  /**
   * 是否展示开场白的消息
   */
  showOnboardingMessage: boolean;
  /**
   * 开场白是否居中展示
   */
  isOnboardingCentered: boolean;
  /**
   * 是否展示 停止回复
   */
  showStopRespond: boolean;

  /**
   * 是否强制展示开场白消息（跳过默认开场白页面）
   */
  forceShowOnboardingMessage: boolean;

  /**
   * 布局方式
   */
  layout: Layout;

  /**
   * 是否强制展示停止回复按钮
   */
  stopRespondOverrideWaiting: boolean | undefined;
}

export type AllChatAreaPreference = PreferenceContextInterface &
  ProviderPassThroughPreference;
