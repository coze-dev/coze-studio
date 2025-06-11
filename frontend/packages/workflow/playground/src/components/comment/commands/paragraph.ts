import type { CommentEditorCommand } from '../type';
import { CommentEditorBlockFormat } from '../constant';

export const paragraphCommand: CommentEditorCommand = {
  key: 'o',
  modifier: true,
  exec: ({ model, event }) => {
    event.preventDefault();
    model.markBlock(CommentEditorBlockFormat.Paragraph);
  },
};
