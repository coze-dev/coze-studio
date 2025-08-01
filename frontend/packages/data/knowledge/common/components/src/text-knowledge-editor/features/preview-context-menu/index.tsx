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
      className="absolute bg-white shadow-lg rounded-md py-1 z-50"
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
