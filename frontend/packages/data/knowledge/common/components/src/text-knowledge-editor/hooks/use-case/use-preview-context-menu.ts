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

import { useRef, useEffect, useCallback } from 'react';

import { type Chunk } from '@/text-knowledge-editor/types/chunk';
import { createLocalChunk } from '@/text-knowledge-editor/services/inner/chunk-op.service';

import { useDeleteChunk } from '../inner/use-delete-chunk';

interface UsePreviewContextMenuProps {
  chunks: Chunk[];
  documentId: string;
  onChunksChange?: (chunks: Chunk[]) => void;
  onActiveChunkChange?: (chunk: Chunk) => void;
  onAddChunk?: (chunk: Chunk) => void;
}

// eslint-disable-next-line max-lines-per-function
export const usePreviewContextMenu = ({
  chunks,
  documentId,
  onChunksChange,
  onActiveChunkChange,
  onAddChunk,
}: UsePreviewContextMenuProps) => {
  // Use ref to save the latest chunks reference
  const chunksRef = useRef(chunks);
  const { deleteSlice } = useDeleteChunk();

  // Every time props.chunks is updated, update the ref.
  useEffect(() => {
    chunksRef.current = chunks;
  }, [chunks]);

  // Activate edit mode for specific shardings
  const handleActivateEditMode = useCallback(
    (chunk: Chunk) => {
      onActiveChunkChange?.(chunk);
    },
    [onActiveChunkChange],
  );

  // Add new shardings before specific shardings
  const handleAddChunkBefore = useCallback(
    (chunk: Chunk) => {
      // Get the latest chunks from the ref
      const currentChunks = chunksRef.current;
      const index = currentChunks.findIndex(
        c =>
          c.text_knowledge_editor_chunk_uuid ===
          chunk.text_knowledge_editor_chunk_uuid,
      );
      const sequence =
        currentChunks.find(
          c =>
            c.text_knowledge_editor_chunk_uuid ===
            chunk.text_knowledge_editor_chunk_uuid,
        )?.sequence ?? '1';
      if (index === -1) {
        return;
      }

      const newChunk = createLocalChunk({
        sequence,
      });

      const updatedChunks = [
        ...currentChunks.slice(0, index),
        newChunk,
        ...currentChunks.slice(index),
      ];

      onChunksChange?.(updatedChunks);

      // Automatically activate editing mode for new shardings
      onActiveChunkChange?.(newChunk);
      onAddChunk?.(newChunk);
    },
    [onChunksChange, onActiveChunkChange, documentId, onAddChunk],
  );

  // Add new shardings after specific shardings
  const handleAddChunkAfter = useCallback(
    (chunk: Chunk) => {
      // Get the latest chunks from the ref
      const currentChunks = chunksRef.current;
      const index = currentChunks.findIndex(
        c =>
          c.text_knowledge_editor_chunk_uuid ===
          chunk.text_knowledge_editor_chunk_uuid,
      );
      if (index === -1) {
        return;
      }

      const sequence =
        currentChunks.find(
          c =>
            c.text_knowledge_editor_chunk_uuid ===
            chunk.text_knowledge_editor_chunk_uuid,
        )?.sequence ?? '1';
      const newChunk = createLocalChunk({
        sequence: String(Number(sequence) + 1),
      });

      const updatedChunks = [
        ...currentChunks.slice(0, index + 1),
        newChunk,
        ...currentChunks.slice(index + 1),
      ];

      // Automatically activate editing mode for new shardings
      onActiveChunkChange?.(newChunk);
      onChunksChange?.(updatedChunks);
      onAddChunk?.(newChunk);
    },
    [onChunksChange, onActiveChunkChange, documentId, onAddChunk],
  );

  // Remove specific shardings
  const handleDeleteChunk = useCallback(
    (chunk: Chunk) => {
      // Get the latest chunks from the ref
      const currentChunks = chunksRef.current;
      const updatedChunks = currentChunks.filter(
        c =>
          c.text_knowledge_editor_chunk_uuid !==
          chunk.text_knowledge_editor_chunk_uuid,
      );
      if (!chunk.slice_id) {
        return;
      }
      deleteSlice(chunk.slice_id).then(() => {
        onChunksChange?.(updatedChunks);
      });
    },
    [onChunksChange, deleteSlice],
  );

  return {
    handleActivateEditMode,
    handleAddChunkBefore,
    handleAddChunkAfter,
    handleDeleteChunk,
  };
};
