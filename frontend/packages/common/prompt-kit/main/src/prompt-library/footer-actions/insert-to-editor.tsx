import { type EditorAPI } from '@flow-lang-sdk/editor/preset-prompt';
import { I18n } from '@coze-arch/i18n';
import { Button } from '@coze/coze-design';
import { insertToNewline } from '@coze-common/prompt-kit-base/shared';

export const InsertToEditor = (props: {
  outerEditor: EditorAPI;
  prompt: string;
  onInsertPrompt: (prompt: string) => void;
  onCancel: (e: React.MouseEvent) => void;
}) => {
  const { outerEditor, prompt, onInsertPrompt, onCancel } = props;
  return (
    <Button
      disabled={!prompt}
      onClick={async e => {
        const insertPrompt = await insertToNewline({
          editor: outerEditor,
          prompt,
        });
        onInsertPrompt(insertPrompt);
        onCancel?.(e);
      }}
    >
      {I18n.t('prompt_resource_insert_prompt')}
    </Button>
  );
};
