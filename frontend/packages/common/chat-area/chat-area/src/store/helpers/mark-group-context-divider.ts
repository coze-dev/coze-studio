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

import { type Message, type MessageGroup } from '../types';
import { getMessagesByGroup } from '../../utils/message-group/get-message-by-group';

/**
 * !!! mutate
 * @Param group will be changed
 */
export const markGroupShowContextDivider = ({
  group,
  messages,
  isShow,
}: {
  group: MessageGroup;
  isShow: boolean;
  messages: Message[];
}) => {
  if (!isShow) {
    group.showContextDivider = null;
    return;
  }

  const groupMessages = getMessagesByGroup(group, messages);

  // security policy
  if (
    groupMessages.some(message => Boolean(message.extra_info.new_section_id))
  ) {
    group.showContextDivider = 'without-onboarding';
    return;
  }

  group.showContextDivider = 'with-onboarding';
  return;
};
