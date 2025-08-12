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

import { Toast } from '@coze-arch/coze-design';

import { type Chunk } from '@/text-knowledge-editor/types/chunk';
import { isEditorContentChange } from '@/text-knowledge-editor/services/use-case/is-editor-content-change';
import { updateChunks } from '@/text-knowledge-editor/services/inner/chunk-op.service';
import { useUpdateChunk } from '@/text-knowledge-editor/hooks/inner/use-update-chunk';

export interface UseUpdateRemoteChunkProps {
  chunks: Chunk[];
  onChunksChange?: (chunks: Chunk[]) => void;
  onUpdateChunk?: (chunk: Chunk) => void;
}

export const useUpdateRemoteChunk = ({
  chunks,
  onChunksChange,
  onUpdateChunk,
}: UseUpdateRemoteChunkProps) => {
  const { updateSlice } = useUpdateChunk();

  /**
   * Handling updates for remote sharding
   */
  const updateRemoteChunk = async (chunk: Chunk) => {
    if (!chunk.slice_id) {
      Toast.error('The slice ID does not exist. Please refresh the page');
      return;
    }
    if (!isEditorContentChange(chunks, chunk)) {
      onChunksChange?.(chunks);
      return;
    }
    await updateSlice(chunk.slice_id, chunk.content ?? '');
    const newChunks = updateChunks(chunks, chunk);
    onUpdateChunk?.(chunk);
    onChunksChange?.(newChunks);
  };

  return {
    updateRemoteChunk,
  };
};
