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
  useDeleteMessageGroup,
  useIsDeleteMessageLock,
  useMessageBoxContext,
} from '@coze-common/chat-area';
import { I18n } from '@coze-arch/i18n';
import { IconCozTrashCan } from '@coze-arch/coze-design/icons';
import { IconButton, Tooltip } from '@coze-arch/coze-design';

import { useTooltipTrigger } from '../../hooks/use-tooltip-trigger';

type DeleteMessageProps = Omit<
  ComponentProps<typeof IconButton>,
  'icon' | 'iconSize' | 'onClick'
>;

export const DeleteMessage: React.FC<PropsWithChildren<DeleteMessageProps>> = ({
  className,
  ...props
}) => {
  const { groupId } = useMessageBoxContext();
  const trigger = useTooltipTrigger('hover');
  const isDeleteMessageLock = useIsDeleteMessageLock(groupId);
  const deleteMessageGroup = useDeleteMessageGroup();

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
          // Just index through groupId.
          deleteMessageGroup(groupId);
        }}
        color="secondary"
        {...props}
      />
    </Tooltip>
  );
};
