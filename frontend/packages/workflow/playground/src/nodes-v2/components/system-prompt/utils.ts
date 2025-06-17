import type { EditorAPI } from '@coze-editor/editor/preset-prompt';

export const focusToAnchor = (
  editor: EditorAPI,
  pos?: { from: number; to: number },
) => {
  if (pos) {
    editor.$view.dispatch({
      selection: { anchor: pos.to },
    });
  }

  editor.$view.focus();
};
