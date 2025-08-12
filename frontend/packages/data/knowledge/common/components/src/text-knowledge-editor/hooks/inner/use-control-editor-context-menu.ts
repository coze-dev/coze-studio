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

interface UseControlEditorContextMenuProps {
  contextMenuRef: React.RefObject<HTMLDivElement>;
}

export const useControlEditorContextMenu = ({
  contextMenuRef,
}: UseControlEditorContextMenuProps) => {
  const [contextMenuPosition, setContextMenuPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);

  // Handle right-click menus
  const openContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenuPosition({
      x: e.clientX,
      y: e.clientY,
    });
  };

  // Close the right-click menu
  const closeContextMenu = () => {
    setContextMenuPosition(null);
  };

  // Process Click Document Other Locations
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // If you click outside the right-click menu, close the menu
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
