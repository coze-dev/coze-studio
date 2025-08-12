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
import { deleteLocalChunk as deleteLocalChunkService } from '@/text-knowledge-editor/services/inner/chunk-op.service';

export interface UseDeleteLocalChunkProps {
  chunks: Chunk[];
  onChunksChange?: (chunks: Chunk[]) => void;
}

export const useDeleteLocalChunk = ({
  chunks,
  onChunksChange,
}: UseDeleteLocalChunkProps) => {
  /**
   * Handle deletion of local shardings
   */
  const deleteLocalChunk = (chunk: Chunk) => {
    if (!chunk.local_slice_id) {
      return;
    }
    const newChunks = deleteLocalChunkService(chunks, chunk.local_slice_id);
    onChunksChange?.(newChunks);
  };

  return {
    deleteLocalChunk,
  };
};
