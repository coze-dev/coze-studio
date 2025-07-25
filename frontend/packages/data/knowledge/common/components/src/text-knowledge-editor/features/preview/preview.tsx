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
 
import React, { useRef } from 'react';

import classNames from 'classnames';

import { type Chunk } from '@/text-knowledge-editor/types/chunk';
import { useHoverEffect } from '@/text-knowledge-editor/hooks/inner/use-hover-effect';
import { useControlContextMenu } from '@/text-knowledge-editor/hooks/inner/use-control-context-menu';
import { DocumentChunkPreview } from '@/text-knowledge-editor/components/preview-chunk/document';

import { type PreviewContextMenuItemRegistry } from '../preview-context-menu-items/registry';
import PreviewContextMenu from '../preview-context-menu';
import { type HoverEditBarActionRegistry } from '../hover-edit-bar-actions/registry';
import { HoverEditBar } from '../hover-edit-bar';
interface DocumentPreviewProps {
  chunk: Chunk;
  chunks: Chunk[];
  readonly?: boolean;
  locateId?: string;
  hoverEditBarActionsRegistry: HoverEditBarActionRegistry;
  previewContextMenuItemsRegistry: PreviewContextMenuItemRegistry;
  onActivateEditMode?: (chunk: Chunk) => void;
}

const DocumentPreviewComponent: React.FC<DocumentPreviewProps> = props => {
  const {
    chunk,
    chunks,
    readonly = false,
    locateId,
    onActivateEditMode,
    hoverEditBarActionsRegistry,
    previewContextMenuItemsRegistry,
  } = props;
  const contextMenuRef = useRef<HTMLDivElement>(null);
  const { hoveredChunk, handleMouseEnter, handleMouseLeave } = useHoverEffect();

  const { contextMenuPosition, openContextMenu } = useControlContextMenu({
    contextMenuRef,
  });

  return (
    <div className="relative">
      <div
        className={classNames(
          // 布局
          'relative overflow-hidden',
        )}
        onContextMenu={readonly ? undefined : e => openContextMenu(e)}
        onMouseEnter={
          readonly
            ? undefined
            : () => handleMouseEnter(chunk.text_knowledge_editor_chunk_uuid)
        }
        onMouseLeave={readonly ? undefined : handleMouseLeave}
        onDoubleClick={readonly ? undefined : () => onActivateEditMode?.(chunk)}
      >
        {/* 悬停时显示的操作栏 */}
        {hoveredChunk === chunk.text_knowledge_editor_chunk_uuid &&
        !readonly ? (
          <HoverEditBar
            chunk={chunk}
            chunks={chunks}
            hoverEditBarActionsRegistry={hoverEditBarActionsRegistry}
          />
        ) : null}

        <DocumentChunkPreview chunk={chunk} locateId={locateId || ''} />
      </div>

      {/* 右键菜单 */}
      {contextMenuPosition ? (
        <PreviewContextMenu
          previewContextMenuItemsRegistry={previewContextMenuItemsRegistry}
          x={contextMenuPosition.x}
          y={contextMenuPosition.y}
          chunk={chunk}
          chunks={chunks}
          readonly={readonly}
          contextMenuRef={contextMenuRef}
        />
      ) : null}
    </div>
  );
};

// 使用React.memo包装组件，避免不必要的重新渲染
export const DocumentPreview = React.memo(
  DocumentPreviewComponent,
  (prevProps, nextProps) => {
    // 如果分片内容变化，需要重新渲染
    if (prevProps.chunk.content !== nextProps.chunk.content) {
      return false;
    }

    // 其他情况下不需要重新渲染
    return true;
  },
);
