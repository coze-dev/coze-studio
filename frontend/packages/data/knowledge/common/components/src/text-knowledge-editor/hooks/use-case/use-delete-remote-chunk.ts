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
import { deleteRemoteChunk as deleteRemoteChunkService } from '@/text-knowledge-editor/services/inner/chunk-op.service';
import { useDeleteChunk } from '@/text-knowledge-editor/hooks/inner/use-delete-chunk';

export interface UseDeleteRemoteChunkProps {
  chunks: Chunk[];
  onChunksChange?: (chunks: Chunk[]) => void;
  onDeleteChunk?: (chunk: Chunk) => void;
}

export const useDeleteRemoteChunk = ({
  chunks,
  onChunksChange,
  onDeleteChunk,
}: UseDeleteRemoteChunkProps) => {
  const { deleteSlice } = useDeleteChunk();

  /**
   * Handling remotely sharding deletion operations
   */
  const deleteRemoteChunk = async (chunk: Chunk) => {
    if (!chunk.slice_id) {
      return;
    }
    await deleteSlice(chunk.slice_id);
    const newChunks = deleteRemoteChunkService(chunks, chunk.slice_id);
    onChunksChange?.(newChunks);
    onDeleteChunk?.(chunk);
  };

  return {
    deleteRemoteChunk,
  };
};
