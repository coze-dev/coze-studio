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
 * Remove the action component for specific shardings
 *
 * The logic to remove specific shardings is implemented internally
 * If an onDelete callback is passed, it will be called on click
 * If chunks, onChunksChange are provided, the deletion logic is handled internally.
 * No need to rely on external usePreviewContextMenu
 */
export const DeleteAction: React.FC<HoverEditBarActionProps> = ({
  chunk,
  chunks = [],
  disabled,
}) => {
  // Remove specific shardings
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
