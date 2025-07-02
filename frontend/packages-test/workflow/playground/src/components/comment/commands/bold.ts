import type { CommentEditorCommand } from '../type';
import { CommentEditorLeafFormat } from '../constant';

export const boldCommand: CommentEditorCommand = {
  key: 'b',
  modifier: true,
  exec: ({ model, event }) => {
    event.preventDefault();
    model.markLeaf(CommentEditorLeafFormat.Bold);
  },
};
