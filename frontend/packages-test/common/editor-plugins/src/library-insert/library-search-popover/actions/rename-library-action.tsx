import { type RefObject } from 'react';

import { type EditorAPI } from '@coze-editor/editor/preset-prompt';
import { I18n } from '@coze-arch/i18n';
import { Button } from '@coze-arch/coze-design';

import { type ILibraryItem } from '../../types';

interface RenameLibraryActionProps {
  editorRef: RefObject<EditorAPI>;
  library: ILibraryItem;
  range: {
    left: number;
    right: number;
  };
  onRename?: (pos: { from: number; to: number }) => void;
}
export const RenameLibraryAction = ({
  editorRef,
  library,
  range,
  onRename,
}: RenameLibraryActionProps) => {
  const handleRename = () => {
    if (!editorRef.current) {
      return;
    }
    editorRef.current?.$view.dispatch({
      changes: {
        from: range.left,
        to: range.right,
        insert: library.name,
      },
    });
    onRename?.({ from: range.left, to: range.right });
  };
  return (
    <Button onClick={handleRename} color="primary" size="small">
      {I18n.t('edit_block_api_rename')}
    </Button>
  );
};
