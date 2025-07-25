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
 
import { PluginName } from './plugin-name';
export { PluginName };

export const enum PluginMode {
  Readonly = 'readonly',
  Writeable = 'writeable',
}

/**
 * 按照领域进行分层设计
 * AppLifeCycle：处理SDK整个生命周期，例如初始化、销毁等
 * MessageLifeCycle：处理消息链路的生命周期
 * CommandLifeCycle：指令、事件相关
 */
export type AppLifeCycle =
  | 'onAfterCreateStores'
  | 'onBeforeInitial'
  | 'onAfterInitial'
  | 'onInitialError'
  | 'onBeforeDestroy';

export type CommandLifeCycle =
  | 'onBeforeClearHistory'
  | 'onAfterClearHistory'
  | 'onBeforeClearContext'
  | 'onAfterClearContext'
  | 'onBeforeStopResponding'
  | 'onStopRespondingError'
  | 'onAfterStopResponding'
  | 'onClearContextError'
  | 'onOnboardingSelectChange'
  | 'onInputClick'
  | 'onSelectionChange'
  | 'onImageClick'
  | 'onInputPaste';

export type MessageLifeCycle =
  | 'onBeforeSendMessage'
  | 'onAfterSendMessage'
  | 'onSendMessageError'
  | 'onBeforeReceiveMessage'
  | 'onBeforeProcessReceiveMessage'
  | 'onBeforeMessageGroupListUpdate'
  | 'onAfterProcessReceiveMessage'
  | 'onBeforeDeleteMessage'
  | 'onAfterDeleteMessage'
  | 'onDeleteMessageError'
  | 'onBeforeGetMessageHistoryList'
  | 'onBeforeDistributeMessageIntoMemberSet';

export type RenderLifeCycle = 'onMessageBoxRender';

export const enum LifeCycleStage {
  LifeCycleStart = 'lifeCycleStart',
  LifeCycleEnd = 'lifeCycleEnd',
  PluginStart = 'pluginStart',
  PluginEnd = 'pluginEnd',
}

export const enum LifeCycleScope {
  App = 'app',
  Message = 'message',
  Command = 'command',
}
