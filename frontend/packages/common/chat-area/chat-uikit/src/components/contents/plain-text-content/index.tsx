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

import { type FC } from 'react';

import { type MessageMentionListFields } from '@coze-common/chat-core/src/message/types';
import {
  type IBaseContentProps,
  type GetBotInfo,
} from '@coze-common/chat-uikit-shared';

import { ThinkingPlaceholder } from '../../chat';
import { isText } from '../../../utils/is-text';

import './index.less';

export type IPlainTextMessageContentProps = Omit<
  IBaseContentProps,
  'message'
> & {
  getBotInfo: GetBotInfo;
  content: string;
  mentioned: MessageMentionListFields['mention_list'][0] | undefined;
  isContentLoading: boolean | undefined;
};

export const PlainTextContent: FC<IPlainTextMessageContentProps> = props => {
  const { content, isContentLoading } = props;

  if (!isText(content)) {
    return null;
  }

  return (
    <div className="chat-uikit-plain-text-content">
      {isContentLoading ? (
        <ThinkingPlaceholder className="!p-0 !h-20px" />
      ) : (
        <span>{`${getMentionBotContent(props)}${content}`}</span>
      )}
    </div>
  );
};

PlainTextContent.displayName = 'PlainTextContent';

const getMentionBotContent = ({
  mentioned,
  getBotInfo,
}: IPlainTextMessageContentProps) => {
  // The interface does not necessarily return mention_list
  if (!mentioned) {
    return '';
  }
  const name = getBotInfo(mentioned.id)?.nickname;
  if (!name) {
    return '';
  }
  return `@${name} `;
};
