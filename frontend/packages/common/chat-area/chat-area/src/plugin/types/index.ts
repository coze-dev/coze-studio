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

import { type Reporter } from '@coze-arch/logger';

import { type PluginStore } from '../../store/plugins';
import type { LoadMoreClientMethod } from '../../service/load-more';
import type {
  ChatAreaContext,
  StoreSet,
} from '../../context/chat-area-context/type';
import { type useChatActionLockService } from '../../context/chat-action-lock';

export type Selector<T> = <U>(params: {
  selector: (state: T) => U;
  equalityFn?: (a: U, b: U) => boolean;
}) => U;

export interface LifeCycleContext {
  reporter?: Reporter;
  usePluginStore: PluginStore;
}

export interface MethodCommonDeps {
  context: Pick<
    ChatAreaContext,
    'reporter' | 'eventCallback' | 'lifeCycleService'
  >;
  storeSet: StoreSet;
  services: {
    loadMoreClient: LoadMoreClientMethod;
    chatActionLockService: ReturnType<typeof useChatActionLockService>;
  };
}
