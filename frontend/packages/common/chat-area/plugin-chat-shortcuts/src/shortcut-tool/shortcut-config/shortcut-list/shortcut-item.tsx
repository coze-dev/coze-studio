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

import { type FC, useEffect, useRef } from 'react';

import type { ShortCutCommand } from '@coze-agent-ide/tool-config';
import {
  ToolItem,
  ToolItemActionEdit,
  ToolItemActionDelete,
  ToolItemActionDrag,
} from '@coze-agent-ide/tool';
import { type ConnectDnd } from '@coze-studio/components';
import { I18n } from '@coze-arch/i18n';
import { UIModal } from '@coze-arch/bot-semi';

import style from '../index.module.less';
import DefaultShortcutIcon from '../../../assets/shortcut-icon-default.svg';

interface ShortcutItemProps {
  shortcut: ShortCutCommand;
  isReadonly: boolean;
  connect: ConnectDnd;
  isDragging: boolean;
  onRemove?: (shortcut: ShortCutCommand) => void;
  onEdit?: (shortcut: ShortCutCommand) => void;
  onDisorder?: (order: number) => void;
}

export const ShortcutItem: FC<ShortcutItemProps> = ({
  shortcut,
  onEdit,
  onRemove,
  connect,
  isReadonly,
  isDragging,
}) => {
  const dropRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<HTMLDivElement>(null);
  connect(dropRef, dragRef);
  useEffect(() => {
    connect(dropRef, dragRef);
  }, [dragRef, dropRef]);
  // Click Delete to pop up the secondary confirmation pop-up window.
  const openConfirmRemoveModal = () => {
    UIModal.info({
      title: I18n.t('bot_ide_shortcut_removal_confirm'),
      width: 320,
      icon: null,
      closeIcon: <></>,
      className: style['delete-modal'],
      cancelText: I18n.t('Cancel'),
      okText: I18n.t('Remove'),
      cancelButtonProps: { className: style['delete-modal-cancel-button'] },
      okButtonProps: {
        className: style['delete-modal-ok-button'],
      },
      onOk: () => onRemove?.(shortcut),
    });
  };

  return (
    <div ref={dropRef}>
      <ToolItem
        title={shortcut.command_name ?? ''}
        description={shortcut.description ?? ''}
        avatar={shortcut.shortcut_icon?.url || DefaultShortcutIcon}
        avatarStyle={{
          padding: '10px',
          background: '#fff',
        }}
        actions={
          <>
            <div ref={dragRef}>
              <ToolItemActionDrag
                data-testid="chat-area.shortcut.drag-button"
                isDragging={isDragging}
                disabled={isReadonly}
              />
            </div>
            <ToolItemActionEdit
              tooltips={I18n.t('bot_ide_shortcut_item_edit')}
              onClick={() => onEdit?.(shortcut)}
              data-testid="chat-area.shortcut.edit-button"
              disabled={isReadonly}
            />
            <ToolItemActionDelete
              tooltips={I18n.t('bot_ide_shortcut_item_trash')}
              onClick={() => openConfirmRemoveModal()}
              disabled={isReadonly}
              data-testid="chat-area.shortcut.delete-button"
            />
          </>
        }
      />
    </div>
  );
};
