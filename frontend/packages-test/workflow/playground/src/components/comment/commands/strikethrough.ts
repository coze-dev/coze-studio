import type { CommentEditorCommand } from '../type';
import { CommentEditorLeafFormat } from '../constant';

export const strikethroughCommand: CommentEditorCommand = {
  key: 's',
  modifier: true,
  exec: ({ model, event }) => {
    event.preventDefault();
    model.markLeaf(CommentEditorLeafFormat.Strikethrough);
  },
};
