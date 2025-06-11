import type { CommentEditorCommand } from '../type';
import { CommentEditorLeafFormat } from '../constant';

export const italicCommand: CommentEditorCommand = {
  key: 'i',
  modifier: true,
  exec: ({ model, event }) => {
    event.preventDefault();
    model.markLeaf(CommentEditorLeafFormat.Italic);
  },
};
