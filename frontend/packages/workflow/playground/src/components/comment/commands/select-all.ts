import { Editor, Transforms } from 'slate';

import type { CommentEditorCommand } from '../type';

export const selectAllCommand: CommentEditorCommand = {
  key: 'a',
  modifier: true,
  exec: ({ model, event }) => {
    event.preventDefault();
    Transforms.select(model.editor, {
      anchor: Editor.start(model.editor, []),
      focus: Editor.end(model.editor, []),
    });
  },
};
