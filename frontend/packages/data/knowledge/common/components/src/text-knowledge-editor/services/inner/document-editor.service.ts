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
 * Update document sharding content
 */
export const updateChunkContent = (chunk: Chunk, content: string): Chunk => ({
  ...chunk,
  content,
});

/**
 * Update chunks
 */
export const updateChunks = (chunks: Chunk[], chunk: Chunk): Chunk[] =>
  chunks.map(c => (c.slice_id === chunk.slice_id ? chunk : c));

/**
 * Get active sharding
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
 * Process the HTML content output by the editor
 * Remove unnecessary outer < p > tags to maintain the original content format
 */
export const processEditorContent = (content: string): string => {
  if (!content) {
    return '';
  }

  // If the content is wrapped with < p > tags, and there is only one < p > tag
  const singleParagraphMatch = content.match(/^<p>(.*?)<\/p>$/s);
  if (singleParagraphMatch) {
    return singleParagraphMatch[1];
  }

  return content;
};
