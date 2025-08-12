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

import { type LevelDocumentChunk } from '../../types/level-document';

export interface ActiveChunkInfo {
  chunk: LevelDocumentChunk | null;
  renderPath: string | null;
}

/**
 * Manage the rendering path for chunks with the same ID in a document
 * Solve the problem of duplicate IDs by assigning a unique render path to each chunk instance
 */
export const useChunkRenderPath = () => {
  // Store the active chunk and its render path
  const [activeChunkInfo, setActiveChunkInfo] = useState<ActiveChunkInfo>({
    chunk: null,
    renderPath: null,
  });

  /**
   * Set the active chunk, but not the render path
   * Usually used in external logic, such as usePreviewContextMenu
   */
  const setActiveChunk = (chunk: LevelDocumentChunk | null) => {
    setActiveChunkInfo(prev => ({
      ...prev,
      chunk,
    }));
  };

  /**
   * Clear active chunks
   */
  const clearActiveChunk = () => {
    setActiveChunkInfo({
      chunk: null,
      renderPath: null,
    });
  };

  /**
   * Set the active chunk and its rendering path
   * Use during user interaction (e.g. double-clicking)
   */
  const setActiveChunkWithPath = (
    chunk: LevelDocumentChunk,
    renderPath: string,
  ) => {
    setActiveChunkInfo({
      chunk,
      renderPath,
    });
  };

  /**
   * Checks whether the given chunk and rendering path match the currently active chunk
   */
  const isActiveChunk = (chunkId: string, renderPath: string) =>
    chunkId === activeChunkInfo.chunk?.text_knowledge_editor_chunk_uuid &&
    renderPath === activeChunkInfo.renderPath;

  /**
   * Generate a unique render path for chunks
   */
  const generateRenderPath = (basePath: string, chunkId: string) =>
    `${basePath}-${chunkId}`;

  return {
    activeChunkInfo,
    setActiveChunk,
    clearActiveChunk,
    setActiveChunkWithPath,
    isActiveChunk,
    generateRenderPath,
  };
};
