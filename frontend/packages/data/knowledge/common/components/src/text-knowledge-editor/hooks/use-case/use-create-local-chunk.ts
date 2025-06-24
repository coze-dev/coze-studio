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
   * 处理本地分片的创建操作
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
