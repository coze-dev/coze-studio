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

import { type ReadonlyAppLifeCycleServiceGenerator } from '@coze-common/chat-area';

import {
  ChatBackgroundEventName,
  type BackgroundPluginBizContext,
} from '../../types/biz-context';

export const bizAppLifeCycleService: ReadonlyAppLifeCycleServiceGenerator<
  BackgroundPluginBizContext
> = plugin => ({
  onBeforeInitial: () => {
    const { chatBackgroundEvent, storeSet } = plugin.pluginBizContext;

    const { setBackgroundInfo } = storeSet.useChatBackgroundContext.getState();

    chatBackgroundEvent.on(
      ChatBackgroundEventName.OnBackgroundChange,
      backgroundInfo => {
        setBackgroundInfo(backgroundInfo);
      },
    );
  },

  onAfterInitial: ctx => {
    const { setBackgroundInfo, clearBackgroundStore } =
      plugin.pluginBizContext.storeSet.useChatBackgroundContext.getState();
    const ctxBackgroundInfo = ctx.messageListFromService.backgroundInfo;
    if (ctxBackgroundInfo) {
      setBackgroundInfo(ctxBackgroundInfo);
    } else {
      clearBackgroundStore();
    }
  },

  onBeforeDestroy: () => {
    const { chatBackgroundEvent } = plugin.pluginBizContext;
    chatBackgroundEvent.all.clear();
  },
});
