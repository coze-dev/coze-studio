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
 * 使用 context 保证是单例
 */
export class LoadMoreClient {
  constructor(private loadEnv: LoadMoreEnvTools) {}

  /**
   * 初始化加载时不需要主动发送请求
   * 1. 做数据录入处理
   * 2. 滚动定位至未读第一条
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
    // 忽略消息推送（home bot分享落地页续聊场景）
    if (ignoreIndexAndHistoryMessages) {
      return;
    }

    // 等待初始化完成再继续进行 index 变更事件响应
    // 受异步过程影响，需要重新读取 env values
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
      // 后端没做避让 先去掉判断
      // return;
    }
    // 避让输出中的回复
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
