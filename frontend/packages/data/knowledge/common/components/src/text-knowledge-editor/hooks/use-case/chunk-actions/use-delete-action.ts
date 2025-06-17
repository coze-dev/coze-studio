import { useCallback, useRef, useEffect } from 'react';

import { type Chunk } from '@/text-knowledge-editor/types/chunk';
import { useDeleteChunk } from '@/text-knowledge-editor/hooks/inner/use-delete-chunk';

interface UseDeleteActionProps {
  chunks: Chunk[];
  onChunksChange?: (params: { chunks: Chunk[]; targetChunk: Chunk }) => void;
}

/**
 * 删除分片的 hook
 *
 * 提供删除特定分片的功能
 */
export const useDeleteAction = ({
  chunks,
  onChunksChange,
}: UseDeleteActionProps) => {
  // 使用ref保存最新的chunks引用
  const chunksRef = useRef<Chunk[]>(chunks);
  const { deleteSlice } = useDeleteChunk();

  // 每次props.chunks更新时，更新ref
  useEffect(() => {
    chunksRef.current = chunks;
  }, [chunks]);

  /**
   * 删除特定分片
   */
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
        onChunksChange?.({
          chunks: updatedChunks,
          targetChunk: chunk,
        });
      });
    },
    [onChunksChange, deleteSlice],
  );

  return {
    deleteChunk: handleDeleteChunk,
  };
};
