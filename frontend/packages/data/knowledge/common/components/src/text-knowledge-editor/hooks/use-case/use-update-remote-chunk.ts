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
   * 处理远程分片的更新操作
   */
  const updateRemoteChunk = async (chunk: Chunk) => {
    if (!chunk.slice_id) {
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
