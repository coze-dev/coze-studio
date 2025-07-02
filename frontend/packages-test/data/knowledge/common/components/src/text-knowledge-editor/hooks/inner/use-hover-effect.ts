import { useState } from 'react';

export const useHoverEffect = () => {
  const [hoveredChunk, setHoveredChunk] = useState<string | null>(null);

  // 处理鼠标悬停事件
  const handleMouseEnter = (chunkId: string) => {
    setHoveredChunk(chunkId);
  };

  // 处理鼠标离开事件
  const handleMouseLeave = () => {
    setHoveredChunk(null);
  };

  return {
    hoveredChunk,
    handleMouseEnter,
    handleMouseLeave,
  };
};
