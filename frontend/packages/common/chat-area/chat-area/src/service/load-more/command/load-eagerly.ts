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

import { LoadCommand, type LoadCommandEnvTools } from '../load-command';
import { type LoadAction } from '../../../store/message-index';
import {
  ReportErrorEventNames,
  ReportEventNames,
} from '../../../report-events/report-event-names';
import { getReportError } from '../../../report-events';
import {
  CURSOR_TO_LOAD_LATEST_MESSAGE,
  LOAD_EAGERLY_LOAD_MESSAGE_COUNT,
} from '../../../constants/message';

/**
 * Go directly to the bottom data
 */
export class LoadEagerly extends LoadCommand {
  action: LoadAction = 'load-eagerly';

  constructor(
    envTools: LoadCommandEnvTools,
    // Voice call unconditional refresh message list dedicated
    private unconditionally = false,
  ) {
    super(envTools);
  }

  async load() {
    const { readEnvValues } = this.envTools;
    const {
      enableTwoWayLoad,
      nextHasMore,
      scrollViewFarFromBottom: needScroll,
    } = readEnvValues();

    const needLoadDataIndeed = enableTwoWayLoad && nextHasMore;
    const needLoadData = needLoadDataIndeed || this.unconditionally;

    if (!needScroll && !needLoadData) {
      return;
    }

    if (needLoadData) {
      await this.executeLoad();
    } else {
      this.onlyScrollToBottom();
    }
  }

  private onlyScrollToBottom() {
    const { getScrollController } = this.envTools;
    getScrollController()?.scrollToPercentage(1);
  }

  private async executeLoad() {
    const {
      messageIndexHelper,
      reporter,
      loadLockErrorHelper,
      loadRequest,
      insertMessages,
    } = this.envTools;
    const { action } = this;

    if (loadLockErrorHelper.checkLoadLockUsing(action)) {
      return;
    }

    const { loadLock } = loadLockErrorHelper.onLoadStart(action);
    this.onlyScrollToBottom();
    try {
      const loadDirection = LoadDirection.Prev;

      const res = await loadRequest({
        cursor: CURSOR_TO_LOAD_LATEST_MESSAGE,
        loadDirection,
        count: LOAD_EAGERLY_LOAD_MESSAGE_COUNT,
      });

      const isResValid = loadLockErrorHelper.verifyLock(action, loadLock);
      if (!isResValid) {
        return;
      }

      const abortInfo = messageIndexHelper.getShouldAbortLoadedMessage(
        res.message_list,
      );
      const { abort: abortLoaded } = abortInfo;
      insertMessages(res, {
        toLatest: true,
        clearFirst: abortLoaded,
      });

      messageIndexHelper.updateIndexAndHasMoreAfterLoad(res, {
        refreshIndexByRequest: false,
        loadDirection,
      });
      loadLockErrorHelper.onLoadSuccess(action);
      reporter.event({
        eventName: ReportEventNames.LoadEagerly,
        // make TypeScript happy
        meta: Object(abortInfo),
      });
    } catch (err) {
      reporter.errorEvent({
        eventName: ReportErrorEventNames.LoadSilentlyFail,
        ...getReportError(err),
      });
      loadLockErrorHelper.onLoadError(action);
    }
  }
}
