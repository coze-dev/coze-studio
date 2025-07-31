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

import { nanoid } from 'nanoid';
import { SliceStatus } from '@coze-arch/bot-api/knowledge';

import { type Chunk } from '@/text-knowledge-editor/types/chunk';

export const createLocalChunk = (props: { sequence: string }): Chunk => {
  const localSliceId = nanoid();
  return {
    text_knowledge_editor_chunk_uuid: nanoid(),
    local_slice_id: localSliceId,
    slice_id: localSliceId,
    sequence: props.sequence,
    content: '',
  };
};

/**
 * Update local sharding
 */
export const updateLocalChunk = ({
  chunks,
  localChunkSliceId,
  newChunk,
}: {
  chunks: Chunk[];
  localChunkSliceId: string;
  newChunk: Chunk;
}): Chunk[] =>
  chunks.map(c => (c.local_slice_id === localChunkSliceId ? newChunk : c));

// Delete local sharding
export const deleteLocalChunk = (
  chunks: Chunk[],
  localChunkSliceId: string,
): Chunk[] => chunks.filter(c => c.local_slice_id !== localChunkSliceId);

/**
 * Update document sharding content
 */
export const updateChunkContent = (chunk: Chunk, content: string): Chunk => ({
  ...chunk,
  content,
});

// Delete remote sharding
export const deleteRemoteChunk = (
  chunks: Chunk[],
  remoteChunkSliceId: string,
): Chunk[] => chunks.filter(c => c.slice_id !== remoteChunkSliceId);

/**
 * Update chunks
 */
export const updateChunks = (chunks: Chunk[], chunk: Chunk): Chunk[] =>
  chunks.map(c => (c.slice_id === chunk.slice_id ? chunk : c));

/**
 * Create remote sharding
 */
export const createRemoteChunk = (props: {
  sequence: string;
  content: string;
  slice_id?: string;
}): Chunk => ({
  text_knowledge_editor_chunk_uuid: nanoid(),
  status: SliceStatus.FinishVectoring,
  content: props.content,
  sequence: props.sequence,
  slice_id: props.slice_id ?? '',
});
