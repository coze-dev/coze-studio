import React, { useRef } from 'react';

import classNames from 'classnames';
import { EditorContent, type Editor } from '@tiptap/react';

import { getEditorWordsCls } from '@/text-knowledge-editor/services/inner/get-editor-words-cls';
import { getEditorTableClassname } from '@/text-knowledge-editor/services/inner/get-editor-table-cls';
import { getEditorImgClassname } from '@/text-knowledge-editor/services/inner/get-editor-img-cls';
import { processEditorContent } from '@/text-knowledge-editor/services/inner/document-editor.service';
import { useOutEditorMode } from '@/text-knowledge-editor/hooks/inner/use-out-editor-mode';
import { useControlEditorContextMenu } from '@/text-knowledge-editor/hooks/inner/use-control-editor-context-menu';

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
   * 使用编辑器上下文菜单功能
   * 当右键点击编辑器时，显示上下文菜单
   */

  // 使用内部 hook 处理右键菜单
  const { contextMenuPosition, openContextMenu } = useControlEditorContextMenu({
    contextMenuRef,
  });

  /**
   * 使用编辑器外部点击功能
   * 当点击编辑器外部时，退出编辑模式
   */
  useOutEditorMode({
    editorRef,
    exclude: [contextMenuRef],
    onExitEditMode: () => {
      if (!editor) {
        return;
      }
      const rawContent = editor.isEmpty ? '' : editor.getHTML();
      // 处理编辑器输出内容，移除不必要的<p>标签
      const newContent = processEditorContent(rawContent);
      onBlur?.(newContent);
    },
  });

  if (!editor) {
    return null;
  }

  return (
    <>
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
    </>
  );
};
