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

import { type ComponentProps, type PropsWithChildren } from 'react';

import classNames from 'classnames';
import { I18n } from '@coze-arch/i18n';
import {
  parseMarkdownToGrabNode,
  GrabElementType,
} from '@coze-common/text-grab';
import { messageSource, type MessageContent } from '@coze-common/chat-core';
import {
  safeAsyncThrow,
  typeSafeJsonParseEnhanced,
} from '@coze-common/chat-area-utils';
import { type GrabPluginBizContext } from '@coze-common/chat-area-plugin-message-grab';
import {
  getIsImageMessage,
  ContentType,
  getIsTextMessage,
  useMessageBoxContext,
  type WriteableChatAreaPlugin,
} from '@coze-common/chat-area';
import { IconCozQuotation } from '@coze-arch/coze-design/icons';
import { IconButton, Tooltip } from '@coze-arch/coze-design';

import { useTooltipTrigger } from '../../hooks/use-tooltip-trigger';
import { useQuotePlugin } from '../../hooks/use-quote-plugin';

type QuoteMessageProps = Omit<
  ComponentProps<typeof IconButton>,
  'icon' | 'iconSize' | 'onClick'
>;

export const QuoteMessage: React.FC<
  PropsWithChildren<QuoteMessageProps>
> = props => {
  const plugin = useQuotePlugin();

  const { message } = useMessageBoxContext();

  if (!plugin || message.source === messageSource.Notice) {
    return null;
  }

  return <QuoteMessageImpl {...props} />;
};

/**
 * Brothers, be careful with changes here. The pre-dependency of QuoteMessageImpl is message-grab.
 */
export const QuoteMessageImpl: React.FC<
  PropsWithChildren<QuoteMessageProps>
> = ({ className, ...props }) => {
  // INFO: As is used here because it is clear that the parent component tries to fetch the plugin in advance and intercepts it in advance
  // If there are any changes in the future, please be sure to pay attention here.
  const plugin = useQuotePlugin() as WriteableChatAreaPlugin<
    GrabPluginBizContext,
    unknown
  >;

  const { chatAreaPluginContext, pluginBizContext } = plugin;

  const { useDeleteFile } = plugin.chatAreaPluginContext.writeableHook.file;

  const { getFileStoreInstantValues } =
    chatAreaPluginContext.readonlyAPI.batchFile;

  const { useQuoteStore } = pluginBizContext.storeSet;

  const { onQuote } = pluginBizContext.eventCallbacks;

  const { updateQuoteContent, updateQuoteVisible } = useQuoteStore.getState();

  const { message, meta } = useMessageBoxContext();

  const { content, content_type } = message;

  const trigger = useTooltipTrigger('hover');

  const deleteFile = useDeleteFile();

  const deleteAllFile = () => {
    const { fileIdList } = getFileStoreInstantValues();

    fileIdList.forEach(id => deleteFile(id));
  };

  const handleQuote = () => {
    deleteAllFile();

    if (content_type === ContentType.Image) {
      const contentObj = typeSafeJsonParseEnhanced<
        MessageContent<ContentType.Image>
      >({
        str: content,
        verifyStruct: (
          _content: unknown,
        ): _content is MessageContent<ContentType.Image> =>
          _content instanceof Object && 'image_list' in _content,
        onParseError: error => {
          safeAsyncThrow(error.message);
        },
        onVerifyError: error => {
          safeAsyncThrow(error.message);
        },
      });

      updateQuoteContent(
        contentObj?.image_list.map(img => ({
          type: GrabElementType.IMAGE,
          src: img.image_ori.url,
          children: [],
        })) ?? [],
      );
    } else {
      const grabNodeList = parseMarkdownToGrabNode(content);
      updateQuoteContent(grabNodeList);
    }

    onQuote?.({ botId: message.sender_id ?? '', source: message.source });

    updateQuoteVisible(true);
  };

  const isTextMessage = getIsTextMessage(message);
  const isImageMessage = getIsImageMessage(message);

  if (!isTextMessage && !isImageMessage) {
    return null;
  }

  if (!meta.isGroupLastAnswerMessage) {
    return null;
  }

  if (!plugin) {
    return null;
  }

  return (
    <Tooltip content={I18n.t('quote_ask_in_chat')} trigger={trigger}>
      <IconButton
        data-testid="chat-area.answer-action.quote-message"
        size="small"
        icon={
          <IconCozQuotation
            className={classNames(className, 'w-[14px] h-[14px]')}
          />
        }
        onClick={handleQuote}
        color="secondary"
        {...props}
      />
    </Tooltip>
  );
};

QuoteMessage.displayName = 'QuoteMessage';
