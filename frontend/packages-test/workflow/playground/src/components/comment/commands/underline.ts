import type { CommentEditorCommand } from '../type';
import { CommentEditorLeafFormat } from '../constant';

export const underlineCommand: CommentEditorCommand = {
  key: 'u',
  modifier: true,
  exec: ({ model, event }) => {
    event.preventDefault();
    model.markLeaf(CommentEditorLeafFormat.Underline);
  },
};
