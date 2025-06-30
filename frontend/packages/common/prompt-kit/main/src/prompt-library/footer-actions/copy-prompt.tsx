import copy from 'copy-to-clipboard';
import { type EditorAPI } from '@coze-editor/editor/preset-prompt';
import { I18n } from '@coze-arch/i18n';
import { Button, Toast } from '@coze-arch/coze-design';

export const CopyPrompt = (props: {
  editor: EditorAPI;
  onCopyPrompt: () => void;
}) => {
  const { editor, onCopyPrompt } = props;
  return (
    <Button
      color="primary"
      onClick={() => {
        const text = editor?.$view.state.doc.toString();
        const result = copy(text, { format: 'text/plain' });
        result &&
          Toast.success(I18n.t('prompt_library_prompt_copied_successfully'));
        onCopyPrompt?.();
      }}
    >
      {I18n.t('prompt_detail_copy_prompt')}
    </Button>
  );
};
