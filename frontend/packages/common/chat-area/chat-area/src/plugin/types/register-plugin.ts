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
 
import {
  type ReadonlyChatAreaPlugin,
  type WriteableChatAreaPlugin,
} from '../plugin-class/plugin';
import { type ChatAreaPluginContext } from './plugin-class/chat-area-plugin-context';

/**
 * @deprecated 废弃 使用 PluginRegistryEntry
 */
export interface RegisterPlugin<T = unknown> {
  // 用于创建上下文的函数，期待返回插件上下文类型
  createPluginBizContext: () => T;
  // 插件实现类
  // eslint-disable-next-line @typescript-eslint/naming-convention
  Plugin: new (
    context: T,
    // @ts-expect-error -- 这里应该就是需要unknown
    chatAreaPluginContext: ChatAreaPluginContext<unknown>,
  ) => ReadonlyChatAreaPlugin<T> | WriteableChatAreaPlugin<T>;
}

export type PluginRegistryEntry<T> = RegisterPlugin<T>;
