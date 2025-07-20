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
