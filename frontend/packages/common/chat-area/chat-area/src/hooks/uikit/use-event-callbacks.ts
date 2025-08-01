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

import { useShallow } from 'zustand/react/shallow';
import copy from 'copy-to-clipboard';
import { isFile } from '@coze-common/chat-uikit';
import { I18n } from '@coze-arch/i18n';
import { UIToast } from '@coze-arch/bot-semi';
import {
  type IEventCallbacks,
  type SendTextMessagePayload,
} from '@coze-common/chat-uikit-shared';

import {
  useChatAreaContext,
  useChatAreaStoreSet,
} from '../context/use-chat-area-context';
import { FileManagerEventNames, fileManager } from '../../utils/file-manage';
import { EventNames } from '../../utils/event-bus/uikit-event-bus';
import { usePreference } from '../../context/preference';

export const useEventCallbacks = () => {
  const { eventCallback, lifeCycleService, eventCenter } = useChatAreaContext();
  const { useFileStore } = useChatAreaStoreSet();
  const { enableMention } = usePreference();

  const { updatePreviewURL } = useFileStore(
    useShallow(state => ({
      updatePreviewURL: state.updatePreviewURL,
    })),
  );

  const eventCallbacks: Required<IEventCallbacks> = {
    onLinkClick(params, e) {
      eventCallback?.onMessageLinkClick?.(params, e);

      lifeCycleService.command.onMessageLinkClick({
        ctx: {
          event: e,
          ...params.extra,
        },
      });
    },
    onMessageRetry: () => undefined,
    onCopyUpload: ({ message: msg, extra: { fileIndex } }) => {
      if (isFile(msg.content_obj)) {
        copy(msg.content_obj.file_list[fileIndex ?? 0]?.file_url ?? '');
        UIToast.success({
          content: I18n.t('copy_success') ?? 'Copy Successfully',
        });
      }
    },
    onCancelUpload: ({ message }) =>
      fileManager.emit(
        FileManagerEventNames.CANCEL_UPLOAD_FILE,
        message.extra_info.local_message_id,
      ),
    onRetryUpload: ({ message }) => {
      eventCenter.emit(EventNames.RESEND_MESSAGE, { message });
    },
    onImageClick: async ({ extra }) => {
      eventCallback?.onImageClick
        ? eventCallback.onImageClick(extra)
        : updatePreviewURL(extra.url);

      await lifeCycleService.command.onImageClick({
        ctx: {
          url: extra.url,
        },
      });
    },
    onCardSendMsg: ({ extra }) => {
      const payload: SendTextMessagePayload = {
        mentionList: enableMention ? extra.mentionList : [],
        text: extra.msg || '',
      };

      eventCenter.emit(EventNames.SEND_TEXT_MESSAGE, {
        ...payload,
        clickLocation: 'clickCard',
        options: extra.options,
      });
    },
    onCardUpdateStatus: params => {
      if (typeof params.extra.action === 'string') {
        const payload = {
          messageID: params.message.message_id,
          action: params.extra.action,
        };

        eventCenter.emit(EventNames.UPDATE_CARD_STATUS, payload);
      }
    },
    onCardLinkElementEnter: params => {
      lifeCycleService.command.onCardLinkElementMouseEnter({ ctx: params });
    },
    onCardLinkElementLeave: params => {
      lifeCycleService.command.onCardLinkElementMouseLeave({ ctx: params });
    },
    onMdBoxLinkElementEnter: params => {
      lifeCycleService.command.onMdBoxLinkElementMouseEnter({ ctx: params });
    },
    onMdBoxLinkElementLeave: params => {
      lifeCycleService.command.onMdBoxLinkElementMouseLeave({ ctx: params });
    },
    onMdBoxImageElementEnter(params) {
      lifeCycleService.command.onMdBoxImageElementMouseEnter({ ctx: params });
    },
    onMdBoxImageElementLeave(params) {
      lifeCycleService.command.onMdBoxImageElementMouseLeave({ ctx: params });
    },
  };

  return eventCallbacks;
};
