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

import { type Chunk } from '@/text-knowledge-editor/types/chunk';
import { updateLocalChunk } from '@/text-knowledge-editor/services/inner/chunk-op.service';
import { useCreateChunk } from '@/text-knowledge-editor/hooks/inner/use-create-chunk';

export interface UseCreateLocalChunkProps {
  chunks: Chunk[];
  documentId: string;
  onChunksChange?: (chunks: Chunk[]) => void;
  onAddChunk?: (chunk: Chunk) => void;
}

export const useCreateLocalChunk = ({
  chunks,
  documentId,
  onChunksChange,
  onAddChunk,
}: UseCreateLocalChunkProps) => {
  const { createChunk } = useCreateChunk({
    documentId,
  });

  /**
   * Handle the creation of local shardings
   */
  const createLocalChunk = async (chunk: Chunk) => {
    if (!chunk.local_slice_id) {
      return;
    }
    const newChunk = await createChunk({
      content: chunk.content ?? '',
      sequence: chunk.sequence ?? '1',
    });
    const newChunks = updateLocalChunk({
      chunks,
      localChunkSliceId: chunk.local_slice_id,
      newChunk,
    });
    onAddChunk?.(newChunk);
    onChunksChange?.(newChunks);
  };

  return {
    createLocalChunk,
  };
};
