import { type Editor } from '@tiptap/react';

import { type EditorActionRegistry } from '../editor-actions/registry';

export interface EditorToolbarProps {
  editor: Editor | null;
  actionRegistry: EditorActionRegistry;
}

export const EditorToolbar = ({
  editor,
  actionRegistry,
}: EditorToolbarProps) => (
  <div className="h-[32px] box-content px-2 pt-2">
    {actionRegistry.entries().map(([key, { Component }]) => (
      <Component key={key} editor={editor} />
    ))}
  </div>
);
