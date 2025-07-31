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
  type GetHistoryMessageResponse,
  LoadDirection,
} from '@coze-common/chat-core';
import {
  compareInt64,
  getIsDiffWithinRange,
  getReportError,
  updateOnlyDefined,
} from '@coze-common/chat-area-utils';

import {
  type CommonLoadIndex,
  type LoadMoreEnvTools,
} from '../load-more-env-tools';
import { type Message } from '../../../store/types';
import { getMessageIndexRange } from '../../../store/action-implement/messages/get-message-index-range';
import { ReportErrorEventNames } from '../../../report-events/report-event-names';
import { type MixInitResponse } from '../../../context/chat-area-context/type';
import { MIN_MESSAGE_INDEX_DIFF_TO_ABORT_CURRENT } from '../../../constants/message';

export interface AbortMessageInfo {
  maxLoadIndex: string;
  abort: boolean;
  indexInfo: string;
}
/* eslint-disable @typescript-eslint/consistent-type-definitions -- make ts happy */
export type HasMoreInfo = {
  prevHasMore?: boolean;
  nextHasMore?: boolean;
};
export type CursorInfo = {
  cursor?: string;
  nextCursor?: string;
};
/* eslint-enable @typescript-eslint/consistent-type-definitions -- resume */

export class MessageIndexHelper {
  constructor(private envTools: LoadMoreEnvTools) {}

  public recordFirstLoadAndRefreshIndex = async (
    data: Pick<
      MixInitResponse,
      | 'read_message_index'
      | 'hasMore'
      | 'next_cursor'
      | 'next_has_more'
      | 'cursor'
      | 'conversationId'
    >,
  ) => {
    const { updateCursor, updateHasMore, updateIndex, readEnvValues } =
      this.envTools;
    updateIndex({
      readIndex: data?.read_message_index ?? '0',
    });
    updateHasMore({
      prevHasMore: data?.hasMore ?? false,
      nextHasMore: data?.next_has_more ?? false,
    });
    updateOnlyDefined(updateCursor, {
      cursor: data?.cursor,
      nextCursor: data?.next_cursor,
    });
    if (
      !readEnvValues().enableMarkRead ||
      readEnvValues().ignoreIndexAndHistoryMessages
    ) {
      return;
    }
    await this.refreshIndexByRequest(data.conversationId);
  };

  /**
   * Update index prevHasMore and other data after loading
   */
  public async updateIndexAndHasMoreAfterLoad(
    data: CommonLoadIndex,
    {
      refreshIndexByRequest,
      loadDirection,
    }: {
      refreshIndexByRequest: boolean;
      loadDirection: LoadDirection;
    },
  ) {
    const { updateHasMore, updateCursor, updateIndex, readEnvValues } =
      this.envTools;
    updateOnlyDefined(updateIndex, {
      readIndex: data.read_message_index,
    });
    // Update hasMore and cursor based on corrected hasMore
    const hasMoreInfo = this.getHasMoreByDirection(data, loadDirection);
    updateOnlyDefined(updateHasMore, hasMoreInfo);
    const cursorInfo = this.getCursorByDirection(data, loadDirection);
    updateOnlyDefined(updateCursor, cursorInfo);

    const { enableMarkRead } = readEnvValues();
    if (refreshIndexByRequest && enableMarkRead) {
      await this.refreshIndexByRequest(null);
    }
  }

  public getHasMoreByDirection(
    data: Pick<GetHistoryMessageResponse, 'hasmore' | 'next_has_more'>,
    loadDirection: LoadDirection,
  ): HasMoreInfo {
    const { hasmore: prevHasMore, next_has_more: nextHasMore } = data;
    const res: HasMoreInfo = {
      prevHasMore,
      nextHasMore,
    };
    if (prevHasMore && loadDirection === LoadDirection.Next) {
      // Load next to you prevHasMore
      delete res.prevHasMore;
    }
    if (nextHasMore && loadDirection === LoadDirection.Prev) {
      // Load prev nextHasMore
      delete res.nextHasMore;
    }
    return res;
  }

  /** Here's a problem: load-eagerly is supposed to update all cursors, but loadDirection is passed as Prev */
  public getCursorByDirection(
    data: Pick<GetHistoryMessageResponse, 'cursor' | 'next_cursor'>,
    loadDirection: LoadDirection,
  ): CursorInfo {
    if (loadDirection === LoadDirection.Next) {
      return {
        nextCursor: data.next_cursor,
      };
    }
    return {
      cursor: data.cursor,
    };
  }

  /**
   * Verify index data once by sending a request
   * Home Scene No need to store/debug by conversationId Filter Scene Yes
   */
  private async refreshIndexByRequest(conversationId: string | null) {
    const { requestMessageIndex, reporter, updateIndex } = this.envTools;
    try {
      const indexes = await requestMessageIndex(conversationId);
      updateIndex({
        readIndex: indexes.read_message_index,
        endIndex: indexes.end_message_index,
      });
    } catch (err) {
      reporter.errorEvent({
        eventName: ReportErrorEventNames.LoadSilentlyFail,
        ...getReportError(err),
      });
    }
  }

  public updateEndIndexForMore = (endIndex: string) => {
    const { updateHasMore, readEnvValues, updateIndex } = this.envTools;
    const { maxLoadIndex, endIndex: currentEndIndex } = readEnvValues();
    if (endIndex === currentEndIndex) {
      return;
    }
    if (compareInt64(maxLoadIndex).greaterThan(endIndex)) {
      return;
    }
    updateHasMore({
      nextHasMore: true,
    });
    updateIndex({
      endIndex,
    });
  };

  public getShouldAbortLoadedMessage(
    list: Pick<Message, 'message_index'>[],
  ): AbortMessageInfo {
    const { maxLoadIndex } = this.envTools.readEnvValues();
    const { min, max } = getMessageIndexRange(list);
    const indexInfo = `start ${min}, end ${max}`;
    if (maxLoadIndex === '0') {
      return {
        maxLoadIndex,
        abort: true,
        indexInfo,
      };
    }

    if (!min || !max) {
      return {
        maxLoadIndex,
        abort: true,
        indexInfo,
      };
    }

    if (compareInt64(min).lesserThan(maxLoadIndex)) {
      return {
        maxLoadIndex,
        abort: false,
        indexInfo,
      };
    }

    const isSmallDiff = getIsDiffWithinRange(
      maxLoadIndex,
      min,
      MIN_MESSAGE_INDEX_DIFF_TO_ABORT_CURRENT,
    );
    return {
      maxLoadIndex,
      abort: !isSmallDiff,
      indexInfo,
    };
  }
}
