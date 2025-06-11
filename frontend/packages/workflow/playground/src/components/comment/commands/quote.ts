import type { CommentEditorCommand } from '../type';
import { CommentEditorBlockFormat } from '../constant';

export const quoteCommand: CommentEditorCommand = {
  key: 'q',
  modifier: true,
  exec: ({ model, event }) => {
    event.preventDefault();
    model.markBlock(CommentEditorBlockFormat.Blockquote);
  },
};
