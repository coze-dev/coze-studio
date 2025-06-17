import { nanoid } from 'nanoid';
import { type DocumentChunk } from '@coze-data/knowledge-common-components/text-knowledge-editor/scenes/base';
import { type SliceInfo } from '@coze-arch/bot-api/knowledge';

export const createBaseDocumentChunkBySliceInfo = (
  props: SliceInfo,
): DocumentChunk => ({
  text_knowledge_editor_chunk_uuid: nanoid(),
  ...props,
});
