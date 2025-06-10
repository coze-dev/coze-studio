import { useEditor } from '@flow-lang-sdk/editor/react';
import { type EditorAPI } from '@flow-lang-sdk/editor/preset-prompt';
import { I18n } from '@coze-arch/i18n';
import { IconCozCopy } from '@coze/coze-design/icons';
import { Button, Toast } from '@coze/coze-design';
export const CopyAction = () => {
  const editor = useEditor<EditorAPI>();
  return (
    <Button
      icon={<IconCozCopy />}
      color="primary"
      size="small"
      className="w-6 h-6"
      onClick={() => {
        const text = editor?.$view.state.doc.toString();
        navigator.clipboard.writeText(text);
        Toast.success(I18n.t('prompt_library_prompt_copied_successfully'));
      }}
    />
  );
};
