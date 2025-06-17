import React from 'react';

import classNames from 'classnames';
import { Menu } from '@coze-arch/coze-design';

import { type Chunk } from '@/text-knowledge-editor/types/chunk';
import { type PreviewContextMenuItemRegistry } from '@/text-knowledge-editor/features/preview-context-menu-items/registry';
interface PreviewContextMenuProps {
  x: number;
  y: number;
  chunk: Chunk;
  chunks: Chunk[];
  readonly?: boolean;
  contextMenuRef: React.RefObject<HTMLDivElement>;
  previewContextMenuItemsRegistry: PreviewContextMenuItemRegistry;
}

const PreviewContextMenu: React.FC<PreviewContextMenuProps> = props => {
  const {
    previewContextMenuItemsRegistry,
    chunk,
    chunks,
    readonly,
    contextMenuRef,
    x,
    y,
  } = props;

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
        position="bottomLeft"
        spacing={-4}
        trigger="custom"
        getPopupContainer={() => contextMenuRef.current ?? document.body}
        className={classNames('rounded-lg')}
        render={
          <Menu.SubMenu className={classNames('w-40 p-1')} mode="menu">
            {previewContextMenuItemsRegistry
              .entries()
              .map(([key, { Component }]) => (
                <Component key={key} chunk={chunk} chunks={chunks} />
              ))}
          </Menu.SubMenu>
        }
      />
    </div>
  );
};

export default PreviewContextMenu;
