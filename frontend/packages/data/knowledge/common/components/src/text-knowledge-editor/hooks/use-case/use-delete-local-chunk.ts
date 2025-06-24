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
   * 处理本地分片的删除操作
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
