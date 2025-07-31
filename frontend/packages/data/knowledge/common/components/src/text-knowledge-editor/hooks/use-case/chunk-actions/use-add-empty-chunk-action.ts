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
 * Add new sharding hook after specific sharding
 *
 * Provides the ability to add new shardings after specific shardings
 */
export const useAddEmptyChunkAction = ({
  chunks,
  onChunksChange,
}: UseAddEmptyChunkActionProps) => {
  // Use ref to save the latest chunks reference
  const chunksRef = useRef<Chunk[]>(chunks);

  // Every time props.chunks is updated, update the ref.
  useEffect(() => {
    chunksRef.current = chunks;
  }, [chunks]);

  /**
   * Add new shardings after specific shardings
   * @Returns the result object containing the new sharding and the updated sharding list
   */
  const handleAddEmptyChunkAfter = (chunk: Chunk) => {
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

    onChunksChange?.({
      newChunk,
      chunks: updatedChunks,
    });
  };

  /**
   * Add new shardings before specific shardings
   */
  const handleAddEmptyChunkBefore = (chunk: Chunk) => {
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
