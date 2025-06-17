import { useState, useRef, useEffect } from 'react';

import { type Chunk } from '@/text-knowledge-editor/types/chunk';

export const useControlPreviewContextMenu = () => {
  const [contextMenuInfo, setContextMenuInfo] = useState<{
    x: number;
    y: number;
    chunk: Chunk;
  } | null>(null);
  const contextMenuRef = useRef<HTMLDivElement>(null);

  // 处理右键点击事件
  const openContextMenu = (e: React.MouseEvent, chunk: Chunk) => {
    e.preventDefault();
    setContextMenuInfo({
      x: e.clientX,
      y: e.clientY,
      chunk,
    });
  };

  // 关闭右键菜单
  const closeContextMenu = () => {
    setContextMenuInfo(null);
  };

  // 点击文档其他位置关闭右键菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        contextMenuRef.current &&
        !contextMenuRef.current.contains(event.target as Node)
      ) {
        closeContextMenu();
      }
    };

    window.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return {
    contextMenuInfo,
    contextMenuRef,
    openContextMenu,
    closeContextMenu,
  };
};
