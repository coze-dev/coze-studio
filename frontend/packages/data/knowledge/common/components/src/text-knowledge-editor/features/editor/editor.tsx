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
   * 当右键点击编辑器时，显示上下文菜单
   */
  const { contextMenuPosition, openContextMenu } = useControlContextMenu({
    contextMenuRef,
  });

  /**
   * 当点击编辑器外部时
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
          // 布局
          'relative',
          // 间距
          'mb-2 p-2',
          // 文字样式
          'text-sm leading-5',
          // 颜色
          'coz-fg-primary coz-bg-max',
          // 边框
          'border border-solid coz-stroke-hglt rounded-lg',
        )}
        onContextMenu={openContextMenu}
      >
        <div
          className={classNames(
            // 表格样式
            getEditorTableClassname(),
            // 图片样式
            getEditorImgClassname(),
            // 换行
            getEditorWordsCls(),
          )}
        >
          <EditorContent editor={editor} placeholder={placeholder} />
          {editorBottomSlot}
        </div>
      </div>

      {/* 右键菜单 */}
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
