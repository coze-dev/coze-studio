import type { EditorAPI } from '@flow-lang-sdk/editor/preset-prompt';

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
