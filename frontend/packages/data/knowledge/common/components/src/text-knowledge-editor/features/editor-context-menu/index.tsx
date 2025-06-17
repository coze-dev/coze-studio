import React from 'react';

import classNames from 'classnames';
import { type Editor } from '@tiptap/react';
import { Menu } from '@coze-arch/coze-design';

import { type EditorActionRegistry } from '@/text-knowledge-editor/features/editor-actions/registry';
interface EditorContextMenuProps {
  x: number;
  y: number;
  editor: Editor | null;
  readonly?: boolean;
  contextMenuRef: React.RefObject<HTMLDivElement>;
  editorActionRegistry: EditorActionRegistry;
}

export const EditorContextMenu: React.FC<EditorContextMenuProps> = props => {
  const { editorActionRegistry, readonly, contextMenuRef, x, y, editor } =
    props;

  if (readonly) {
    return null;
  }

  return (
    <div
      ref={contextMenuRef}
      className="fixed bg-white shadow-lg rounded-md py-1 z-50"
      style={{
        top: `${y}px`,
        left: `${x}px`,
      }}
    >
      <Menu
        visible
        clickToHide
        keepDOM
        position="bottomLeft"
        spacing={-4}
        trigger="custom"
        getPopupContainer={() => contextMenuRef.current ?? document.body}
        className={classNames('coz-shadow-large')}
        render={
          <Menu.SubMenu className={classNames('p-1')} mode="menu">
            {editorActionRegistry.entries().map(([key, { Component }]) => (
              <Component key={key} editor={editor} />
            ))}
          </Menu.SubMenu>
        }
      />
    </div>
  );
};
