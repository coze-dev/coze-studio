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

import { processEditorContent } from '../inner/document-editor.service';

/**
 * Determine whether the content has changed
 */
export const isEditorContentChange = (
  chunks: Chunk[],
  chunk: Chunk,
): boolean => {
  const newContent = processEditorContent(chunk.content ?? '');
  const oldContent = chunks.find(c => c.slice_id === chunk.slice_id)?.content;
  return newContent !== oldContent;
};
