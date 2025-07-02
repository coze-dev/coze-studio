import { useState } from 'react';

import { type LevelDocumentTreeNode } from '../../types/level-document';

export interface ActiveChunkInfo {
  chunk: LevelDocumentTreeNode | null;
  renderLevel: string | null;
}

/**
 * 管理文档中活动的chunk
 * 使用renderLevel字段来唯一标识chunk的渲染位置
 */
export const useActiveChunk = () => {
  // 存储活动的chunk和它的renderLevel
  const [activeChunkInfo, setActiveChunkInfo] = useState<ActiveChunkInfo>({
    chunk: null,
    renderLevel: null,
  });

  /**
   * 清除活动chunk信息
   */
  const clearActiveChunk = () => {
    setActiveChunkInfo({
      chunk: null,
      renderLevel: null,
    });
  };

  /**
   * 设置活动chunk和它的renderLevel
   * 在用户交互（如双击）时使用
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
   * 检查给定的chunk是否是当前活动的chunk
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
