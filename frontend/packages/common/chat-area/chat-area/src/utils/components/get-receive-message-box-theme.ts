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

import { type MessageBoxTheme } from '@coze-common/chat-uikit';
import { ContentType } from '@coze-common/chat-core';

import { type Message } from '../../store/types';
import { type PreferenceContextInterface } from '../../context/preference/types';
import { type OnParseReceiveMessageBoxTheme } from '../../context/chat-area-context/chat-area-callback';

export const getReceiveMessageBoxTheme = ({
  message,
  bizTheme,
  onParseReceiveMessageBoxTheme,
}: {
  message: Message;
  bizTheme: PreferenceContextInterface['theme'];
  onParseReceiveMessageBoxTheme: OnParseReceiveMessageBoxTheme | undefined;
}): MessageBoxTheme => {
  const isThemeDisabled =
    message.type === 'follow_up' || message.content_type === ContentType.Card;
  const isBorderTheme = message.content_type === ContentType.Image;
  const customParsed = onParseReceiveMessageBoxTheme?.({ message });

  if (customParsed) {
    return customParsed;
  }

  if (isBorderTheme) {
    return 'border';
  }

  if (isThemeDisabled) {
    return 'none';
  }

  //  After enabling uikit refactoring, home is whiteness and the rest of the scenes are grey
  if (bizTheme === 'home') {
    return 'whiteness';
  }

  return 'grey';
};
