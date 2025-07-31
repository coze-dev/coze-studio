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

import { useEffect } from 'react';

export interface UseOutEditorModeProps {
  editorRef: React.RefObject<HTMLDivElement>;
  exclude?: React.RefObject<HTMLDivElement>[];
  onExitEditMode?: () => void;
}

export const useOutEditorMode = ({
  editorRef,
  exclude,
  onExitEditMode,
}: UseOutEditorModeProps) => {
  // Process Click Document Other Locations
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // If you click outside the editor, exit editing mode
      if (
        editorRef.current &&
        !editorRef.current.contains(event.target as Node) &&
        !exclude?.some(ref => ref.current?.contains(event.target as Node))
      ) {
        onExitEditMode?.();
      }
    };

    window.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('mousedown', handleClickOutside);
    };
  }, [editorRef, exclude, onExitEditMode]);
};
