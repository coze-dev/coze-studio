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
  // 使用ref保存最新的chunks引用
  const chunksRef = useRef(chunks);
  const { deleteSlice } = useDeleteChunk();

  // 每次props.chunks更新时，更新ref
  useEffect(() => {
    chunksRef.current = chunks;
  }, [chunks]);

  // 激活特定分片的编辑模式
  const handleActivateEditMode = useCallback(
    (chunk: Chunk) => {
      onActiveChunkChange?.(chunk);
    },
    [onActiveChunkChange],
  );

  // 在特定分片前添加新分片
  const handleAddChunkBefore = useCallback(
    (chunk: Chunk) => {
      // 从ref中获取最新的chunks
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

      // 自动激活新分片的编辑模式
      onActiveChunkChange?.(newChunk);
      onAddChunk?.(newChunk);
    },
    [onChunksChange, onActiveChunkChange, documentId, onAddChunk],
  );

  // 在特定分片后添加新分片
  const handleAddChunkAfter = useCallback(
    (chunk: Chunk) => {
      // 从ref中获取最新的chunks
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

      // 自动激活新分片的编辑模式
      onActiveChunkChange?.(newChunk);
      onChunksChange?.(updatedChunks);
      onAddChunk?.(newChunk);
    },
    [onChunksChange, onActiveChunkChange, documentId, onAddChunk],
  );

  // 删除特定分片
  const handleDeleteChunk = useCallback(
    (chunk: Chunk) => {
      // 从ref中获取最新的chunks
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
