import { type SliceStatus } from '@coze-arch/bot-api/knowledge';

export interface Chunk {
  text_knowledge_editor_chunk_uuid: string;
  slice_id?: string;
  local_slice_id?: string;
  content?: string;
  sequence?: string;
  status?: SliceStatus;
}
