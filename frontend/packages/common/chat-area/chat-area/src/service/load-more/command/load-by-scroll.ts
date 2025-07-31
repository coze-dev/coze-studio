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

import { LoadDirection } from '@coze-common/chat-core';
import { safeAsyncThrow } from '@coze-common/chat-area-utils';
import { reporter } from '@coze-arch/logger';

import { LoadCommand } from '../load-command';
import { type LoadAction } from '../../../store/message-index';
import { ReportErrorEventNames } from '../../../report-events/report-event-names';
import { getReportError } from '../../../report-events';
import {
  LOAD_NEXT_ANCHOR_ADDITIONAL_MOVE_DISTANCE,
  LOAD_NEXT_LOCK_DELAY,
} from '../../../constants/scroll-list';

export class LoadByScrollPrev extends LoadCommand {
  action: LoadAction = 'load-prev';
  async load() {
    if (!this.getShouldLoad()) {
      return;
    }
    const {
      readEnvValues,
      loadRequest,
      insertMessages,
      messageIndexHelper,
      loadLockErrorHelper,
    } = this.envTools;
    const { cursor: prevCursor } = readEnvValues();
    const { action } = this;
    const loadDirection = LoadDirection.Prev;
    const { loadLock } = loadLockErrorHelper.onLoadStart(action);

    try {
      const res = await loadRequest({
        cursor: prevCursor,
        loadDirection,
      });
      const isValidLock = loadLockErrorHelper.verifyLock(action, loadLock);
      if (!isValidLock) {
        return;
      }

      insertMessages(res, { toLatest: false });
      messageIndexHelper.updateIndexAndHasMoreAfterLoad(res, {
        refreshIndexByRequest: true,
        loadDirection,
      });

      loadLockErrorHelper.onLoadSuccess(action);
    } catch (err) {
      reporter.errorEvent({
        eventName: ReportErrorEventNames.LoadByScrollPrevFail,
        ...getReportError(err),
      });

      loadLockErrorHelper.onLoadError(action);
    }
  }

  private getShouldLoad() {
    const { readEnvValues, loadLockErrorHelper } = this.envTools;
    const { prevHasMore } = readEnvValues();

    if (!prevHasMore) {
      return false;
    }
    return !loadLockErrorHelper.checkLoadLockUsing(this.action);
  }
}

export class LoadByScrollNext extends LoadCommand {
  action: LoadAction = 'load-next';

  async load() {
    if (!this.getShouldLoad()) {
      return;
    }
    const {
      readEnvValues,
      loadRequest,
      insertMessages,
      messageIndexHelper,
      loadLockErrorHelper,
    } = this.envTools;
    const { nextCursor } = readEnvValues();
    const { action } = this;

    const { loadLock } = loadLockErrorHelper.onLoadStart(action);

    try {
      const res = await loadRequest({
        cursor: nextCursor,
        loadDirection: LoadDirection.Next,
      });

      const isValidLock = loadLockErrorHelper.verifyLock(action, loadLock);
      if (!isValidLock) {
        return;
      }

      messageIndexHelper.updateIndexAndHasMoreAfterLoad(res, {
        refreshIndexByRequest: true,
        loadDirection: LoadDirection.Next,
      });
      insertMessages(res, { toLatest: true });
      loadLockErrorHelper.onLoadSuccess(action, {
        remainLock: true,
      });

      this.simulateOverflowAnchor(loadLock);
    } catch (err) {
      reporter.errorEvent({
        eventName: ReportErrorEventNames.LoadByScrollNextFail,
        ...getReportError(err),
      });

      loadLockErrorHelper.onLoadError(action);
    }
  }

  private getShouldLoad(): boolean {
    const { readEnvValues, loadLockErrorHelper } = this.envTools;
    const { nextHasMore } = readEnvValues();

    if (!nextHasMore) {
      return false;
    }
    return !loadLockErrorHelper.checkLoadLockUsing(this.action);
  }

  private simulateOverflowAnchor(loadLock: number) {
    const verifyLoadLockStillValid = () =>
      this.envTools.loadLockErrorHelper.verifyLock(this.action, loadLock);

    const scrollController = this.envTools.getScrollController();
    if (!scrollController) {
      safeAsyncThrow('cannot get scrollController in simulateOverflowAnchor');
      return;
    }
    const { getOriginScrollInfo } = scrollController;

    const scrollInfo = getOriginScrollInfo();

    this.envTools.waitMessagesLengthChangeLayoutEffect(() => {
      if (!verifyLoadLockStillValid()) {
        return;
      }

      const newScrollInfo = getOriginScrollInfo();

      const properScrollTop =
        scrollInfo.scrollHeight - newScrollInfo.scrollHeight;
      const optimizedScrollTop =
        properScrollTop + LOAD_NEXT_ANCHOR_ADDITIONAL_MOVE_DISTANCE;

      scrollController.scrollTo(() => optimizedScrollTop);

      const unlockLoadScroll = () => {
        if (!verifyLoadLockStillValid()) {
          return;
        }

        const { action } = this;
        this.envTools.updateLockAndErrorByImmer(state => {
          state.loadLock[action] = null;
        });
      };
      // I wanted to use requestAnimationFrame, but it didn't work. Let's make a living
      setTimeout(unlockLoadScroll, LOAD_NEXT_LOCK_DELAY);
    });
  }
}
