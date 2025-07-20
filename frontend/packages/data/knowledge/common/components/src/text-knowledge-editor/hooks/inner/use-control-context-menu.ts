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
 
import { useState, useEffect } from 'react';

interface UseControlContextMenuProps {
  contextMenuRef: React.RefObject<HTMLDivElement>;
}

export const useControlContextMenu = ({
  contextMenuRef,
}: UseControlContextMenuProps) => {
  const [contextMenuPosition, setContextMenuPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);

  // 处理右键菜单
  const openContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();

    // 计算相对于事件目标元素的位置
    const rect = e.currentTarget.getBoundingClientRect();
    const relativeX = e.clientX - rect.left;
    const relativeY = e.clientY - rect.top;

    setContextMenuPosition({
      x: relativeX,
      y: relativeY,
    });
  };

  // 关闭右键菜单
  const closeContextMenu = () => {
    setContextMenuPosition(null);
  };

  // 处理点击文档其他位置
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // 如果点击的是右键菜单外部，则关闭菜单
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
    contextMenuPosition,
    openContextMenu,
    closeContextMenu,
  };
};
