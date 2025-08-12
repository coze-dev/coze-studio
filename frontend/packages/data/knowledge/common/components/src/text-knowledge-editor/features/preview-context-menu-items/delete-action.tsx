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

import React from 'react';

import classNames from 'classnames';
import { I18n } from '@coze-arch/i18n';
import { IconCozTrashCan } from '@coze-arch/coze-design/icons';
import { Menu } from '@coze-arch/coze-design';

import { useDeleteAction } from '@/text-knowledge-editor/hooks/use-case/chunk-actions';
import { eventBus } from '@/text-knowledge-editor/event';

import { type PreviewContextMenuItemProps } from './module';

/**
 * Remove a specific sharding menu item component
 */
export const DeleteAction: React.FC<PreviewContextMenuItemProps> = ({
  chunk,
  chunks = [],
  disabled,
}) => {
  const getIconStyles = (isDisabled: boolean) =>
    classNames('w-3.5 h-3.5', {
      'opacity-30': isDisabled,
    });

  const getMenuItemStyles = (isDisabled: boolean) =>
    classNames('h-8 px-2 py-2 text-xs rounded-lg', {
      'cursor-not-allowed': isDisabled,
    });

  // Remove specific shardings
  const { deleteChunk } = useDeleteAction({
    chunks,
    onChunksChange: ({ chunks: newChunks }) => {
      eventBus.emit('previewContextMenuItemAction', {
        type: 'delete',
        targetChunk: chunk,
        chunks: newChunks,
      });
    },
  });

  return (
    <Menu.Item
      disabled={disabled}
      icon={<IconCozTrashCan className={getIconStyles(!!disabled)} />}
      onClick={() => deleteChunk(chunk)}
      className={getMenuItemStyles(!!disabled)}
    >
      {I18n.t('Delete')}
    </Menu.Item>
  );
};
