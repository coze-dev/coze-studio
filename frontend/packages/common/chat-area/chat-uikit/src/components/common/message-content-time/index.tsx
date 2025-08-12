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

import classNames from 'classnames';

import { formatMessageBoxContentTime } from '../../../utils/date-time';

export const MessageContentTime = ({
  contentTime,
  className,
  showBackground,
}: {
  contentTime?: number;
  className?: string;
  showBackground: boolean;
}) => {
  if (!contentTime) {
    return null;
  }
  return (
    <span
      className={classNames(
        'text-[12px] leading-[16px] ml-[8px] font-normal',
        'chat-uikit-message-box-container__message-content-time',
        {
          'coz-fg-images-secondary': showBackground,
          'coz-fg-secondary': !showBackground,
        },
        className,
      )}
    >
      {formatMessageBoxContentTime(contentTime)}
    </span>
  );
};

MessageContentTime.displayName = 'MessageContentTime';
