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
 
import { useRef, useEffect } from 'react';

import { type Chunk } from '@/text-knowledge-editor/types/chunk';
import { createLocalChunk } from '@/text-knowledge-editor/services/inner/chunk-op.service';

interface UseAddEmptyChunkActionProps {
  chunks: Chunk[];
  onChunksChange?: (params: { newChunk: Chunk; chunks: Chunk[] }) => void;
}
/**
 * 在特定分片后添加新分片的 hook
 *
 * 提供在特定分片后添加新分片的功能
 */
export const useAddEmptyChunkAction = ({
  chunks,
  onChunksChange,
}: UseAddEmptyChunkActionProps) => {
  // 使用ref保存最新的chunks引用
  const chunksRef = useRef<Chunk[]>(chunks);

  // 每次props.chunks更新时，更新ref
  useEffect(() => {
    chunksRef.current = chunks;
  }, [chunks]);

  /**
   * 在特定分片后添加新分片
   * @returns 包含新分片和更新后的分片列表的结果对象
   */
  const handleAddEmptyChunkAfter = (chunk: Chunk) => {
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

    onChunksChange?.({
      newChunk,
      chunks: updatedChunks,
    });
  };

  /**
   * 在特定分片前添加新分片
   */
  const handleAddEmptyChunkBefore = (chunk: Chunk) => {
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

    onChunksChange?.({
      newChunk,
      chunks: updatedChunks,
    });
  };

  return {
    addEmptyChunkAfter: handleAddEmptyChunkAfter,
    addEmptyChunkBefore: handleAddEmptyChunkBefore,
  };
};
