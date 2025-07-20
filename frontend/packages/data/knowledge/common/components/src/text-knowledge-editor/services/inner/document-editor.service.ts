/*
 * Copyright 2025 coze-dev Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
 
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
