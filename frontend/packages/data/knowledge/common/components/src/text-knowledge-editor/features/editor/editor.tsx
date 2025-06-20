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
