import { useEditor } from '@coze-editor/editor/react';
import { type EditorAPI } from '@coze-editor/editor/preset-prompt';
import { I18n } from '@coze-arch/i18n';

import { useCreatePromptContext } from '@/create-prompt/context';

export const ImportPromptWhenEmptyPlaceholder = () => {
  const editor = useEditor<EditorAPI>();
  const { props, formApiRef } = useCreatePromptContext() || {};
  const { importPromptWhenEmpty } = props || {};

  return importPromptWhenEmpty ? (
    <div
      className="coz-fg-hglt text-sm cursor-pointer mt-1"
      onClick={() => {
        editor?.$view.dispatch({
          changes: {
            from: 0,
            to: editor.$view.state.doc.length,
            insert: importPromptWhenEmpty,
          },
        });
        formApiRef?.current?.setValue('prompt_text', importPromptWhenEmpty);
      }}
    >
      {I18n.t('creat_new_prompt_import_link')}
    </div>
  ) : null;
};
