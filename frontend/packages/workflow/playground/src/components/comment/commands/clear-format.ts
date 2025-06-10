import type { CommentEditorCommand } from '../type';
import { CommentEditorBlockFormat } from '../constant';

export const clearFormatEnterCommand: CommentEditorCommand = {
  key: 'Enter',
  shift: false,
  exec: ({ model, event }) => {
    // 检查是否正在输入拼音
    if (event.nativeEvent.isComposing) {
      return;
    }

    const isEmptyBlock = !model.getBlockText().text;
    const hasBlockFormat = !model.isBlockMarked(
      CommentEditorBlockFormat.Paragraph,
    );

    if (!isEmptyBlock || !hasBlockFormat) {
      return;
    }

    event.preventDefault();
    model.clearFormat();
  },
};

export const clearFormatBackspaceCommand: CommentEditorCommand = {
  key: 'Backspace',
  shift: false,
  exec: ({ model, event }) => {
    const isAtBlockStart = !model.getBlockText().before;
    const hasBlockFormat = !model.isBlockMarked(
      CommentEditorBlockFormat.Paragraph,
    );

    if (!isAtBlockStart || !hasBlockFormat) {
      return;
    }

    event.preventDefault();
    model.clearFormat();
  },
};
