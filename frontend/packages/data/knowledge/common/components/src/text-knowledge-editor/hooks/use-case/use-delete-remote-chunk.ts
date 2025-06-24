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
   * 处理远程分片的删除操作
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
