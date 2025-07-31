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

import { debounce } from 'lodash-es';
import {
  compareInt64,
  getReportError,
  safeAsyncThrow,
} from '@coze-common/chat-area-utils';
import { type Reporter } from '@coze-arch/logger';
import { DeveloperApi } from '@coze-arch/bot-api';

import { type UpdateMessageIndex } from '../../store/message-index';
import { ReportErrorEventNames } from '../../report-events/report-event-names';
import { ReportEventNames } from '../../report-events';
import {
  MARK_MESSAGE_READ_DEBOUNCE_INTERVAL,
  MARK_MESSAGE_READ_DEBOUNCE_MAX_WAIT,
} from '../../constants/message';

export interface EnvInfo {
  conversationId: string | null;
  currentReadIndex: string;
}

export class MarkReadHelper {
  public updateIndex: UpdateMessageIndex;
  public reporter: Reporter;
  public getEnvInfo: () => EnvInfo;

  constructor({
    getEnvInfo,
    reporter,
    updateIndex,
  }: {
    getEnvInfo: () => EnvInfo;
    reporter: Reporter;
    updateIndex: UpdateMessageIndex;
  }) {
    this.getEnvInfo = getEnvInfo;
    this.reporter = reporter;
    this.updateIndex = updateIndex;
  }
}

export class MarkReadService {
  private index = '0';

  constructor(private getHelper: () => MarkReadHelper) {}

  public requireMarkRead = (index: string) => {
    if (compareInt64(index).greaterThan(this.index)) {
      this.index = index;
    }
    this.throttledMarkRead();
  };

  private throttledMarkRead = debounce(
    () => this.executeMarkRead(),
    MARK_MESSAGE_READ_DEBOUNCE_INTERVAL,
    {
      leading: false,
      trailing: true,
      maxWait: MARK_MESSAGE_READ_DEBOUNCE_MAX_WAIT,
    },
  );

  private executeMarkRead = async () => {
    const readIndex = this.index;
    const { reporter, updateIndex, getEnvInfo } = this.getHelper();
    const { conversationId, currentReadIndex } = getEnvInfo();
    if (!conversationId) {
      safeAsyncThrow('get no conversationId');
      return;
    }
    if (!compareInt64(readIndex).greaterThan(currentReadIndex)) {
      return;
    }
    try {
      const res = await DeveloperApi.MarkRead({
        conversation_id: conversationId || '',
        mark_time: Date.now(),
        read_message_index: readIndex,
      });
      updateIndex({
        readIndex: res.read_message_index,
      });

      reporter.event({
        eventName: ReportEventNames.MarkMessageRead,
        meta: {
          read_index: readIndex,
        },
      });
    } catch (e) {
      reporter.errorEvent({
        eventName: ReportErrorEventNames.MarkMessageReadFail,
        ...getReportError(e),
      });
    }
  };
}
