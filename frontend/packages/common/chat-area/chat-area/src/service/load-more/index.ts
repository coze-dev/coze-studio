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

import type ChatCore from '@coze-common/chat-core';
import {
  compareInt64,
  getIsDiffWithinRange,
} from '@coze-common/chat-area-utils';

import { getFakeChatCore } from '../../utils/fake-chat-core';
import { ReportEventNames } from '../../report-events';
import type { MixInitResponse } from '../../context/chat-area-context/type';
import { LOAD_SILENTLY_MAX_NEW_ADDED_COUNT } from '../../constants/message';
import type {
  GetScrollController,
  LoadMoreEnvTools,
} from './load-more-env-tools';
import {
  OnInitialLoadEffect,
  InitialLoadLocating,
  type LocateUnreadMessageParam,
} from './command/on-initial-load-effect';
import { OnClearHistoryEffect } from './command/on-clear-history-effect';
import { LoadSilently } from './command/load-silently';
import { LoadPassivelyCommand } from './command/load-passively';
import { LoadEagerly } from './command/load-eagerly';
import { LoadByScrollNext, LoadByScrollPrev } from './command/load-by-scroll';

export type LoadMoreClientMethod = Pick<
  LoadMoreClient,
  | 'handleInitialLoadIndex'
  | 'loadPassively'
  | 'loadEagerly'
  | 'loadEagerlyUnconditionally'
  | 'loadByScrollNext'
  | 'loadByScrollPrev'
  | 'loadSilently'
  | 'injectChatCoreIntoEnv'
  | 'onMessageIndexChange'
  | 'onClearHistory'
  | 'injectGetScrollController'
  | 'clearMessageIndexStore'
>;
/**
 * The use of context guarantees is a singleton
 */
export class LoadMoreClient {
  constructor(private loadEnv: LoadMoreEnvTools) {}

  /**
   * No active request is required when initializing the load
   * 1. Do data entry processing
   * 2. Scroll to the first unread item
   */
  public handleInitialLoadIndex = async (data: MixInitResponse) => {
    await new OnInitialLoadEffect(this.loadEnv, data).runAsync();
  };

  public locateToUnreadMessage = (data: LocateUnreadMessageParam) =>
    new InitialLoadLocating(this.loadEnv, data).run();

  public injectChatCoreIntoEnv(core: ChatCore | null) {
    this.loadEnv.injectChatCore(core || getFakeChatCore());
  }

  public injectGetScrollController(fn: GetScrollController) {
    this.loadEnv.injectGetScrollController(fn);
  }

  public loadEagerly = () => new LoadEagerly(this.loadEnv).load();
  public loadEagerlyUnconditionally = () =>
    new LoadEagerly(this.loadEnv, true).load();
  public loadByScrollPrev = () => new LoadByScrollPrev(this.loadEnv).load();
  public loadByScrollNext = () => new LoadByScrollNext(this.loadEnv).load();
  public loadSilently = () => new LoadSilently(this.loadEnv).load();
  public loadPassively = (endIndex: string) =>
    new LoadPassivelyCommand(this.loadEnv, endIndex).load();

  public onClearHistory = () => new OnClearHistoryEffect(this.loadEnv).run();

  public onMessageIndexChange = async (endIndex: string) => {
    const { ignoreIndexAndHistoryMessages } = this.loadEnv.readEnvValues();
    // Ignore push notification (home bot sharing landing page continuation scene)
    if (ignoreIndexAndHistoryMessages) {
      return;
    }

    // Wait for initialization to complete before proceeding with index change event response
    // Affected by asynchronous process, need to re-read env values
    await this.loadEnv.waitChatCoreReady();
    const { maxLoadIndex } = this.loadEnv.readEnvValues();

    const newEndIsGreater = compareInt64(endIndex).greaterThan(maxLoadIndex);
    if (!newEndIsGreater) {
      this.loadEnv.reporter.event({
        eventName: ReportEventNames.LoadMoreOnMessageUnexpectedIndexChange,
        meta: {
          maxLoadIndex,
          newEndIsGreater,
          endIndex,
        },
      });
      // The back-end did not evade, so remove the judgment first.
      // return;
    }
    // Avoid reply in output
    await this.loadEnv.waitChatProcessFinish();
    const shouldBeSilent = getIsDiffWithinRange(
      endIndex,
      maxLoadIndex,
      LOAD_SILENTLY_MAX_NEW_ADDED_COUNT,
    );

    this.loadEnv.reporter.event({
      eventName: ReportEventNames.LoadMoreConsumeMessageIndexChange,
      meta: {
        shouldBeSilent,
        endIndex,
      },
    });

    if (shouldBeSilent) {
      await this.loadSilently();
    } else {
      await this.loadPassively(endIndex);
    }
  };

  public clearMessageIndexStore() {
    this.loadEnv.clearMessageIndexStore();
  }
}

export const fallbackLoadMoreClient: LoadMoreClientMethod = {
  handleInitialLoadIndex: () => Promise.resolve(),
  onClearHistory: () => undefined,
  loadEagerly: () => Promise.resolve(),
  loadEagerlyUnconditionally: () => Promise.resolve(),
  injectChatCoreIntoEnv: () => undefined,
  injectGetScrollController: () => undefined,
  loadByScrollPrev: () => Promise.resolve(),
  loadByScrollNext: () => Promise.resolve(),
  loadPassively: () => Promise.resolve(),
  loadSilently: () => Promise.resolve(),
  onMessageIndexChange: () => Promise.resolve(),
  clearMessageIndexStore: () => undefined,
};
