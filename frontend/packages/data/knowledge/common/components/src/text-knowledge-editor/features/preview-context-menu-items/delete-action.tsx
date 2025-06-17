import React from 'react';

import classNames from 'classnames';
import { I18n } from '@coze-arch/i18n';
import { IconCozTrashCan } from '@coze-arch/coze-design/icons';
import { Menu } from '@coze-arch/coze-design';

import { useDeleteAction } from '@/text-knowledge-editor/hooks/use-case/chunk-actions';
import { eventBus } from '@/text-knowledge-editor/event';

import { type PreviewContextMenuItemProps } from './module';

/**
 * 删除特定分片的菜单项组件
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

  // 删除特定分片
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
