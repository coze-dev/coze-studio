import { useEffect, useState } from 'react';

import { useEditor } from '@coze-editor/editor/react';
import { type EditorAPI } from '@coze-editor/editor/preset-prompt';
import { type ViewUpdate } from '@codemirror/view';
export const useReadonly = () => {
  const editor = useEditor<EditorAPI>();
  const [isReadOnly, setIsReadOnly] = useState(false);
  useEffect(() => {
    if (!editor) {
      return;
    }
    setIsReadOnly(editor.$view.state.readOnly);
    const handleViewUpdate = (update: ViewUpdate) => {
      if (update.startState.readOnly !== update.state.readOnly) {
        setIsReadOnly(update.state.readOnly);
      }
    };
    editor.$on('viewUpdate', handleViewUpdate);
    return () => {
      editor.$off('viewUpdate', handleViewUpdate);
    };
  }, [editor]);
  return isReadOnly;
};
