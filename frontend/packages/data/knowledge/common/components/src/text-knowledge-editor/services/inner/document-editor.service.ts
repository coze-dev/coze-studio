import { type Chunk } from '@/text-knowledge-editor/types/chunk';

/**
 * 更新文档分片内容
 */
export const updateChunkContent = (chunk: Chunk, content: string): Chunk => ({
  ...chunk,
  content,
});

/**
 * 更新chunks
 */
export const updateChunks = (chunks: Chunk[], chunk: Chunk): Chunk[] =>
  chunks.map(c => (c.slice_id === chunk.slice_id ? chunk : c));

/**
 * 获取激活的分片
 */
export const getActiveChunk = (
  chunks: Chunk[],
  activeChunkId: string | undefined,
) => {
  if (!activeChunkId) {
    return undefined;
  }
  return chunks.find(chunk => chunk.slice_id === activeChunkId) || undefined;
};

/**
 * 处理编辑器输出的HTML内容
 * 移除不必要的外层<p>标签，保持与原始内容格式一致
 */
export const processEditorContent = (content: string): string => {
  if (!content) {
    return '';
  }

  // 如果内容被<p>标签包裹，并且只有一个<p>标签
  const singleParagraphMatch = content.match(/^<p>(.*?)<\/p>$/s);
  if (singleParagraphMatch) {
    return singleParagraphMatch[1];
  }

  return content;
};
