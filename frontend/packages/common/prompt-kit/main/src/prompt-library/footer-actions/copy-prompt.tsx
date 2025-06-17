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
        navigator.clipboard.writeText(text);
        Toast.success(I18n.t('prompt_library_prompt_copied_successfully'));
        onCopyPrompt?.();
      }}
    >
      {I18n.t('prompt_detail_copy_prompt')}
    </Button>
  );
};
