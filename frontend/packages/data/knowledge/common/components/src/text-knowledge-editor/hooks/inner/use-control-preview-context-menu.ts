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
