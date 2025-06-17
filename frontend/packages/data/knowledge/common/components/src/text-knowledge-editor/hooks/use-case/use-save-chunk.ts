import { type Chunk } from '@/text-knowledge-editor/types/chunk';
import { isContentChange } from '@/text-knowledge-editor/services/inner/document-editor.service';
import {
  deleteLocalChunk,
  deleteRemoteChunk,
  updateChunks,
  updateLocalChunk,
} from '@/text-knowledge-editor/services/inner/chunk-op.service';
import { useUpdateChunk } from '@/text-knowledge-editor/hooks/inner/use-update-chunk';
import { useDeleteChunk } from '@/text-knowledge-editor/hooks/inner/use-delete-chunk';
import { useCreateChunk } from '@/text-knowledge-editor/hooks/inner/use-create-chunk';

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
  const { createChunk } = useCreateChunk({
    documentId,
  });
  const { deleteSlice } = useDeleteChunk();
  const { updateSlice } = useUpdateChunk();

  /**
   * 处理远程分片的删除操作
   */
  const handleRemoteChunkDelete = async (chunk: Chunk) => {
    if (!chunk.slice_id) {
      return;
    }
    await deleteSlice(chunk.slice_id);
    const newChunks = deleteRemoteChunk(chunks, chunk.slice_id);
    onChunksChange?.(newChunks);
    onDeleteChunk?.(chunk);
  };

  /**
   * 处理远程分片的更新操作
   */
  const handleRemoteChunkUpdate = async (chunk: Chunk) => {
    if (!chunk.slice_id) {
      return;
    }
    if (!isContentChange(chunks, chunk)) {
      onChunksChange?.(chunks);
      return;
    }
    await updateSlice(chunk.slice_id, chunk.content ?? '');
    const newChunks = updateChunks(chunks, chunk);
    onUpdateChunk?.(chunk);
    onChunksChange?.(newChunks);
  };

  /**
   * 处理本地分片的删除操作
   */
  const handleLocalChunkDelete = (chunk: Chunk) => {
    if (!chunk.local_slice_id) {
      return;
    }
    const newChunks = deleteLocalChunk(chunks, chunk.local_slice_id);
    onChunksChange?.(newChunks);
  };

  /**
   * 处理本地分片的创建操作
   */
  const handleLocalChunkCreate = async (chunk: Chunk) => {
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

  /**
   * 处理远程分片的保存逻辑
   */
  const saveRemoteChunk = async (chunk: Chunk) => {
    if (chunk.content === '') {
      await handleRemoteChunkDelete(chunk);
      return;
    }
    await handleRemoteChunkUpdate(chunk);
  };

  /**
   * 处理本地分片的保存逻辑
   */
  const saveLocalChunk = async (chunk: Chunk) => {
    if (chunk.content === '') {
      handleLocalChunkDelete(chunk);
    } else {
      await handleLocalChunkCreate(chunk);
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
