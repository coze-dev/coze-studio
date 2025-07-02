import type { CommentEditorCommand } from '../type';
import { CommentEditorBlockFormat } from '../constant';

export const headingOneCommand: CommentEditorCommand = {
  key: '1',
  modifier: true,
  exec: ({ model, event }) => {
    event.preventDefault();
    model.markBlock(CommentEditorBlockFormat.HeadingOne);
  },
};

export const headingTwoCommand: CommentEditorCommand = {
  key: '2',
  modifier: true,
  exec: ({ model, event }) => {
    event.preventDefault();
    model.markBlock(CommentEditorBlockFormat.HeadingTwo);
  },
};

export const headingThreeCommand: CommentEditorCommand = {
  key: '3',
  modifier: true,
  exec: ({ model, event }) => {
    event.preventDefault();
    model.markBlock(CommentEditorBlockFormat.HeadingThree);
  },
};
