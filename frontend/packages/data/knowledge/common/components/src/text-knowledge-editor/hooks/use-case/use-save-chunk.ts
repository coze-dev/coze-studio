import { type Chunk } from '@/text-knowledge-editor/types/chunk';

import { useUpdateRemoteChunk } from './use-update-remote-chunk';
import { useDeleteRemoteChunk } from './use-delete-remote-chunk';
import { useDeleteLocalChunk } from './use-delete-local-chunk';
import { useCreateLocalChunk } from './use-create-local-chunk';

export interface UseSaveChunkProps {
  chunks: Chunk[];
  documentId: string;
  onChunksChange?: (chunks: Chunk[]) => void;
  onAddChunk?: (chunk: Chunk) => void;
  onUpdateChunk?: (chunk: Chunk) => void;
  onDeleteChunk?: (chunk: Chunk) => void;
}

export const useSaveChunk = ({
  chunks,
  documentId,
  onAddChunk,
  onUpdateChunk,
  onChunksChange,
  onDeleteChunk,
}: UseSaveChunkProps) => {
  const { createLocalChunk } = useCreateLocalChunk({
    chunks,
    documentId,
    onChunksChange,
    onAddChunk,
  });

  const { updateRemoteChunk } = useUpdateRemoteChunk({
    chunks,
    onChunksChange,
    onUpdateChunk,
  });

  const { deleteLocalChunk } = useDeleteLocalChunk({
    chunks,
    onChunksChange,
  });

  const { deleteRemoteChunk } = useDeleteRemoteChunk({
    chunks,
    onChunksChange,
    onDeleteChunk,
  });

  /**
   * 处理远程分片的保存逻辑
   */
  const saveRemoteChunk = async (chunk: Chunk) => {
    if (chunk.content === '') {
      await deleteRemoteChunk(chunk);
      return;
    }
    await updateRemoteChunk(chunk);
  };

  /**
   * 处理本地分片的保存逻辑
   */
  const saveLocalChunk = async (chunk: Chunk) => {
    if (chunk.content === '') {
      deleteLocalChunk(chunk);
    } else {
      await createLocalChunk(chunk);
    }
  };

  /**
   * 保存分片的主函数
   */
  const saveChunk = async (chunk: Chunk) => {
    if (!chunk.local_slice_id) {
      await saveRemoteChunk(chunk);
      return;
    }
    await saveLocalChunk(chunk);
  };

  return {
    saveChunk,
  };
};
