import { type Chunk } from '@/text-knowledge-editor/types/chunk';

import { processEditorContent } from '../inner/document-editor.service';

/**
 * 判断内容是否改变
 */
export const isEditorContentChange = (
  chunks: Chunk[],
  chunk: Chunk,
): boolean => {
  const newContent = processEditorContent(chunk.content ?? '');
  const oldContent = chunks.find(c => c.slice_id === chunk.slice_id)?.content;
  return newContent !== oldContent;
};
