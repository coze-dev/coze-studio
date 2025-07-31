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

import { safeJSONParse } from '@coze-common/chat-uikit';
import { type MixMessageContent } from '@coze-common/chat-core';
import { ContentType, messageSource } from '@coze-common/chat-core';
import { I18n } from '@coze-arch/i18n';
import { type IMessage } from '@coze-common/chat-uikit-shared';

import styles from './index.module.less';

interface PluginAsyncQuoteProps {
  message: IMessage;
}

const filterMixType = [ContentType.Image, ContentType.File, ContentType.Text];
const getMixContent = (list: MixMessageContent['item_list']) => {
  const info = list
    ?.filter(item => filterMixType.indexOf(item?.type ?? '') > -1)
    ?.map(item => {
      if (item.type === ContentType.Image) {
        return `[${I18n.t('editor_toolbar_image')}]`;
      } else if (item.type === ContentType.File) {
        // TODO: jq - If multiple are supported later, there may be problems.
        return item?.file?.file_name ? `[${item?.file?.file_name}]` : '';
      } else if (item.type === ContentType.Text) {
        return item.text;
      }
      return '';
    });
  return info?.join(' ');
};

// Use reference styles only for answers message_type === plugin_async
export const PluginAsyncQuote: FC<PluginAsyncQuoteProps> = props => {
  const { message } = props;
  const replyMessage = message?.reply_message;

  // Add citations only if the reply message is text.
  if (
    !(
      message?.source === messageSource.AsyncResult &&
      replyMessage?.content &&
      message?.content_type === ContentType.Text
    )
  ) {
    return null;
  }

  // The original message quoted is a picture, or file, in a fixed form
  const isImage = replyMessage?.content_type === ContentType.Image;
  const isFile = replyMessage?.content_type === ContentType.File;
  const isMix = replyMessage?.content_type === ContentType.Mix;
  const isNormal = !(isImage || isFile || isMix);

  const { content_obj = safeJSONParse(replyMessage.content) } =
    replyMessage ?? {};
  const imageContent = `[${I18n.t('editor_toolbar_image')}]`;
  const fileName = content_obj?.file_list?.[0]?.file_name;
  const fileContent = fileName ? `[${fileName}]` : '';
  const mixContent = getMixContent(
    content_obj?.item_list as MixMessageContent['item_list'],
  );
  const normalContent = replyMessage?.content;

  return (
    <div className={styles.quote}>
      <div className={styles.left}></div>
      <div className={styles.content}>
        {isImage ? imageContent : null}
        {isFile ? fileContent : null}
        {isMix ? mixContent : null}
        {isNormal ? normalContent : null}
      </div>
    </div>
  );
};
PluginAsyncQuote.displayName = 'PluginAsyncQuote';
