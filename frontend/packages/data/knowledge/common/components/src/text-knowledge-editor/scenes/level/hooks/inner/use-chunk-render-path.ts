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
 * 管理文档中具有相同ID的chunk的渲染路径
 * 通过为每个chunk实例分配唯一的渲染路径，解决重复ID的问题
 */
export const useChunkRenderPath = () => {
  // 存储活动的chunk和它的渲染路径
  const [activeChunkInfo, setActiveChunkInfo] = useState<ActiveChunkInfo>({
    chunk: null,
    renderPath: null,
  });

  /**
   * 设置活动chunk，但不设置渲染路径
   * 通常在外部逻辑中使用，如usePreviewContextMenu
   */
  const setActiveChunk = (chunk: LevelDocumentChunk | null) => {
    setActiveChunkInfo(prev => ({
      ...prev,
      chunk,
    }));
  };

  /**
   * 清除活动chunk信息
   */
  const clearActiveChunk = () => {
    setActiveChunkInfo({
      chunk: null,
      renderPath: null,
    });
  };

  /**
   * 设置活动chunk和它的渲染路径
   * 在用户交互（如双击）时使用
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
   * 检查给定的chunk和渲染路径是否匹配当前活动的chunk
   */
  const isActiveChunk = (chunkId: string, renderPath: string) =>
    chunkId === activeChunkInfo.chunk?.text_knowledge_editor_chunk_uuid &&
    renderPath === activeChunkInfo.renderPath;

  /**
   * 为chunk生成唯一的渲染路径
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
