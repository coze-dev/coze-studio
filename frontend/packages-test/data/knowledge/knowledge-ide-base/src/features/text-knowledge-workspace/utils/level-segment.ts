import { nanoid } from 'nanoid';
import { type ILevelSegment } from '@coze-data/knowledge-stores';
import { type LevelDocumentChunk } from '@coze-data/knowledge-common-components/text-knowledge-editor';

export const createLevelDocumentChunkByLevelSegment = (
  props: ILevelSegment,
): LevelDocumentChunk => ({
  text_knowledge_editor_chunk_uuid: nanoid(),
  sequence: props.slice_sequence?.toString(),
  content: props.text,
  ...props,
});
