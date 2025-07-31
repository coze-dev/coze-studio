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

import React, { useRef } from 'react';

import classNames from 'classnames';
import { EditorContent, type Editor } from '@tiptap/react';

import { getEditorContent } from '@/text-knowledge-editor/services/use-case/get-editor-content';
import { getEditorWordsCls } from '@/text-knowledge-editor/services/inner/get-editor-words-cls';
import { getEditorTableClassname } from '@/text-knowledge-editor/services/inner/get-editor-table-cls';
import { getEditorImgClassname } from '@/text-knowledge-editor/services/inner/get-editor-img-cls';
import { useOutEditorMode } from '@/text-knowledge-editor/hooks/inner/use-out-editor-mode';
import { useControlContextMenu } from '@/text-knowledge-editor/hooks/inner/use-control-context-menu';

import { EditorContextMenu } from '../editor-context-menu';
import { type EditorActionRegistry } from '../editor-actions/registry';

interface DocumentEditorProps {
  editor: Editor | null;
  placeholder?: string;
  editorContextMenuItemsRegistry?: EditorActionRegistry;
  editorBottomSlot?: React.ReactNode;
  onBlur?: (newContent: string) => void;
}

export const DocumentEditor: React.FC<DocumentEditorProps> = props => {
  const {
    editor,
    placeholder,
    editorContextMenuItemsRegistry,
    editorBottomSlot,
    onBlur,
  } = props;
  const editorRef = useRef<HTMLDivElement>(null);
  const contextMenuRef = useRef<HTMLDivElement>(null);

  /**
   * When right-clicking on the editor, the context menu is displayed
   */
  const { contextMenuPosition, openContextMenu } = useControlContextMenu({
    contextMenuRef,
  });

  /**
   * When clicking outside the editor
   */
  useOutEditorMode({
    editorRef,
    exclude: [contextMenuRef],
    onExitEditMode: () => {
      const newContent = getEditorContent(editor);
      onBlur?.(newContent);
    },
  });

  if (!editor) {
    return null;
  }

  return (
    <div className="relative">
      <div
        ref={editorRef}
        className={classNames(
          // layout
          'relative',
          // spacing
          'mb-2 p-2',
          // Text Style
          'text-sm leading-5',
          // color
          'coz-fg-primary coz-bg-max',
          // border
          'border border-solid coz-stroke-hglt rounded-lg',
        )}
        onContextMenu={openContextMenu}
      >
        <div
          className={classNames(
            // table style
            getEditorTableClassname(),
            // image style
            getEditorImgClassname(),
            // line feed
            getEditorWordsCls(),
          )}
        >
          <EditorContent editor={editor} placeholder={placeholder} />
          {editorBottomSlot}
        </div>
      </div>

      {/* right-click menu */}
      {contextMenuPosition && editorContextMenuItemsRegistry ? (
        <EditorContextMenu
          x={contextMenuPosition.x}
          y={contextMenuPosition.y}
          contextMenuRef={contextMenuRef}
          editor={editor}
          editorActionRegistry={editorContextMenuItemsRegistry}
        />
      ) : null}
    </div>
  );
};
