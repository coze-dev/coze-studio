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

import { useState } from 'react';

import { type LevelDocumentTreeNode } from '../../types/level-document';

export interface ActiveChunkInfo {
  chunk: LevelDocumentTreeNode | null;
  renderLevel: string | null;
}

/**
 * Manage active chunks in documents
 * Use the renderLevel field to uniquely identify the render location of the chunk
 */
export const useActiveChunk = () => {
  // Store the active chunk and its renderLevel
  const [activeChunkInfo, setActiveChunkInfo] = useState<ActiveChunkInfo>({
    chunk: null,
    renderLevel: null,
  });

  /**
   * Clear active chunks
   */
  const clearActiveChunk = () => {
    setActiveChunkInfo({
      chunk: null,
      renderLevel: null,
    });
  };

  /**
   * Set the active chunk and its renderLevel
   * Use during user interaction (e.g. double-clicking)
   */
  const setActiveChunkWithLevel = (chunk: LevelDocumentTreeNode) => {
    if (!chunk.renderLevel) {
      console.warn('Chunk does not have renderLevel field', chunk);
      return;
    }

    setActiveChunkInfo({
      chunk,
      renderLevel: chunk.renderLevel,
    });
  };

  /**
   * Checks whether the given chunk is the currently active chunk
   */
  const isActiveChunk = (renderLevel: string | undefined) => {
    if (!renderLevel) {
      return false;
    }
    return renderLevel === activeChunkInfo.renderLevel;
  };

  return {
    activeChunkInfo,
    clearActiveChunk,
    setActiveChunkWithLevel,
    isActiveChunk,
  };
};
