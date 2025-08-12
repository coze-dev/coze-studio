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

import classNames from 'classnames';
import { type IMessage } from '@coze-common/chat-uikit-shared';

import { isText } from '../../../../../utils/is-text';
import { typeSafeSuggestionItemVariants } from './variants';
import './index.less';

interface ISuggestionItemProps {
  message?: Pick<IMessage, 'content_obj' | 'sender_id'>;
  content?: string;
  readonly?: boolean;
  showBackground?: boolean;
  className?: string;
  color?: 'white' | 'grey';
  onSuggestionClick?: (sugParam: {
    text: string;
    mentionList: { id: string }[];
  }) => void;
}

export const SuggestionItem: FC<ISuggestionItemProps> = props => {
  const {
    content,
    message,
    readonly,
    onSuggestionClick,
    showBackground,
    className,
    color,
  } = props;
  const { content_obj = content } = message ?? {};

  if (!isText(content_obj)) {
    return null;
  }

  return (
    <div
      className={classNames(
        className,
        '!bg-[235, 235, 235, 0.75]',
        typeSafeSuggestionItemVariants({
          showBackground: Boolean(showBackground),
          readonly: Boolean(readonly),
          color: color ?? 'white',
        }),
      )}
      onClick={() => {
        if (readonly) {
          return;
        }

        const senderId = message?.sender_id;
        onSuggestionClick?.({
          text: content_obj,
          mentionList: senderId ? [{ id: senderId }] : [],
        });
      }}
    >
      <span className="w-full">{content_obj}</span>
    </div>
  );
};

SuggestionItem.displayName = 'SuggestionItem';
