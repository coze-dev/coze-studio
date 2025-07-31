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

import dayjs from 'dayjs';

export const formatMessageBoxContentTime = (contentTime: number): string => {
  if (contentTime < 1) {
    return '';
  }
  // Day: hh: mm; across the sky: mm-dd hh: mm; New Year's Eve: yyyy-mm-dd hh: mm
  const now = Date.now();
  const today = dayjs(now);
  const messageDay = dayjs(contentTime);
  if (today.year() !== messageDay.year()) {
    return messageDay.format('YYYY-MM-DD HH:mm');
  }
  if (
    today.month() !== messageDay.month() ||
    today.date() !== messageDay.date()
  ) {
    return messageDay.format('MM-DD HH:mm');
  }
  return messageDay.format('HH:mm');
};
