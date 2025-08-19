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
import {
  useChatAreaStoreSet,
  useIsDeleteMessageLock,
  useMessageBoxContext,
} from '@coze-common/chat-area';
import { I18n } from '@coze-arch/i18n';
import { IconCozTrashCan } from '@coze-arch/coze-design/icons';
import { IconButton, Tooltip } from '@coze-arch/coze-design';

import { Layout } from '@/types/client';
import { useChatAppProps } from '@/components/studio-open-chat/store';

import { useDeleteMessage } from '../../hooks/use-delete-message';
import { useCurMessageInfo } from '../../hooks/use-cur-message-info';

type DeleteMessageProps = Omit<
  ComponentProps<typeof IconButton>,
  'icon' | 'iconSize' | 'onClick'
>;

export const DeleteMessage: React.FC<PropsWithChildren<DeleteMessageProps>> = ({
  className,
  ...props
}) => {
  const storeSet = useChatAreaStoreSet();
  const { useGlobalInitStore } = storeSet;
  const { groupId } = useMessageBoxContext();
  const isDeleteMessageLock = useIsDeleteMessageLock(groupId);
  const { chatConfig } = useChatAppProps();
  const deleteMessage = useDeleteMessage();
  const conversationId = useGlobalInitStore(state => state.conversationId);
  const { messageId, cozeApiMessageId, isShowDelete } = useCurMessageInfo();
  const trigger =
    chatConfig.ui?.base?.layout === Layout.MOBILE ? 'custom' : 'hover';

  if (!cozeApiMessageId || !isShowDelete || !messageId) {
    // cozeApiMessageId 不存在的话，说明该条数据有问题，在openApi数据中不存在该条数据，是手工创造的
    return null;
  }

  return (
    <Tooltip trigger={trigger} content={I18n.t('Delete')}>
      <IconButton
        data-testid="chat-area.answer-action.delete-message-button"
        disabled={isDeleteMessageLock}
        size="small"
        icon={
          <IconCozTrashCan
            className={classNames(
              'coz-fg-hglt-red',
              className,
              'w-[14px] h-[14px]',
            )}
          />
        }
        onClick={() => {
          // 通过 groupId 索引即可

          deleteMessage(conversationId || '', messageId);
        }}
        color="secondary"
        {...props}
      />
    </Tooltip>
  );
};
