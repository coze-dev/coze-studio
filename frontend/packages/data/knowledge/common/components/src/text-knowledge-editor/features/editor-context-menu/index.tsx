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
      className="absolute bg-white shadow-lg rounded-md py-1 z-50"
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
