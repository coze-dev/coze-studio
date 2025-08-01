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

import { nanoid } from 'nanoid';
import { cloneDeep } from 'lodash-es';
import { type Reporter } from '@coze-arch/logger';

import { type Message } from '../store/types';
import { ReportEventNames } from '../report-events/report-event-names';

export const getRegenerateMessage = ({
  userMessage,
  reporter,
}: {
  userMessage: Message;
  reporter: Reporter;
}) => {
  const clonedMessage = cloneDeep(userMessage);
  const hasLocalMessageId = Boolean(clonedMessage.extra_info.local_message_id);
  const isFromHistory = Boolean(clonedMessage._fromHistory);
  if (hasLocalMessageId) {
    return clonedMessage;
  }

  if (!isFromHistory) {
    reporter.event({
      eventName: ReportEventNames.NonHistoricalMessageWithoutLocalId,
    });
  }

  clonedMessage.extra_info.local_message_id = nanoid();

  return clonedMessage;
};
