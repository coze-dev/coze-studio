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

import { I18n } from '@coze-arch/i18n';
import { IconCozTrashCan } from '@coze-arch/coze-design/icons';
import { IconButton, Tooltip } from '@coze-arch/coze-design';

import { useDeleteAction } from '@/text-knowledge-editor/hooks/use-case/chunk-actions';
import { eventBus } from '@/text-knowledge-editor/event';

import { type HoverEditBarActionProps } from './module';

/**
 * 删除特定分片的操作组件
 *
 * 内部实现了删除特定分片的逻辑
 * 如果传入了 onDelete 回调，则会在点击时调用
 * 如果提供了 chunks、onChunksChange，则会在内部处理删除逻辑，
 * 无需依赖外部的 usePreviewContextMenu
 */
export const DeleteAction: React.FC<HoverEditBarActionProps> = ({
  chunk,
  chunks = [],
  disabled,
}) => {
  // 删除特定分片
  const { deleteChunk } = useDeleteAction({
    chunks,
    onChunksChange: ({ chunks: newChunks }) => {
      eventBus.emit('hoverEditBarAction', {
        type: 'delete',
        targetChunk: chunk,
        chunks: newChunks,
      });
    },
  });

  return (
    <Tooltip
      content={I18n.t('knowledge_level_028')}
      clickToHide
      autoAdjustOverflow
    >
      <IconButton
        size="small"
        color="secondary"
        disabled={disabled}
        icon={<IconCozTrashCan className="text-[14px]" />}
        iconPosition="left"
        className="coz-fg-secondary leading-none !w-6 !h-6"
        onClick={() => deleteChunk(chunk)}
      />
    </Tooltip>
  );
};
