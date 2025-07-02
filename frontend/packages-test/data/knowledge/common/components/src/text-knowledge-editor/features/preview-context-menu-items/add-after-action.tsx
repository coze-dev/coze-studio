import React from 'react';

import classNames from 'classnames';
import { I18n } from '@coze-arch/i18n';
import { IconCozDocumentAddBottom } from '@coze-arch/coze-design/icons';
import { Menu } from '@coze-arch/coze-design';

import { useAddEmptyChunkAction } from '@/text-knowledge-editor/hooks/use-case/chunk-actions';
import { eventBus } from '@/text-knowledge-editor/event';

import { type PreviewContextMenuItemProps } from './module';

/**
 * 在特定分片后添加新分片的菜单项组件
 */
export const AddAfterAction: React.FC<PreviewContextMenuItemProps> = ({
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

  // 在特定分片后添加新分片
  const { addEmptyChunkAfter } = useAddEmptyChunkAction({
    chunks,
    onChunksChange: ({ newChunk, chunks: newChunks }) => {
      // 发出在特定分片后添加新分片的事件
      eventBus.emit('previewContextMenuItemAction', {
        type: 'add-after',
        newChunk,
        targetChunk: chunk,
        chunks: newChunks,
      });
    },
  });

  return (
    <Menu.Item
      disabled={disabled}
      icon={<IconCozDocumentAddBottom className={getIconStyles(!!disabled)} />}
      onClick={() => addEmptyChunkAfter(chunk)}
      className={getMenuItemStyles(!!disabled)}
    >
      {I18n.t('knowledge_optimize_016')}
    </Menu.Item>
  );
};
