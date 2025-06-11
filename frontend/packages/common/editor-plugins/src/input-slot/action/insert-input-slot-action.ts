import { type EditorAPI } from '@flow-lang-sdk/editor/preset-prompt';
import { I18n } from '@coze-arch/i18n';
import { EditorSelection } from '@codemirror/state';

import { TemplateParser } from '../../shared/utils/template-parser';
const templateParser = new TemplateParser({ mark: 'InputSlot' });

export const insertInputSlot = (
  editor: EditorAPI,
  options?: {
    mode?: 'input' | 'configurable';
    placeholder?: string;
  },
) => {
  if (!editor) {
    return;
  }
  const {
    mode = 'input',
    placeholder = I18n.t('edit_block_guidance_text_placeholder'),
  } = options ?? {};
  const { selection } = editor.$view.state;
  const selectionRange = editor.$view.state.selection.main;
  const content = editor.$view.state.sliceDoc(
    selectionRange.from,
    selectionRange.to,
  );
  const extractedContent = templateParser.extractTemplateContent(content);
  const { open, template, textContent } = templateParser.generateTemplateJson({
    content: extractedContent,
    data: {
      placeholder,
      mode,
    },
  });
  const from = selectionRange.from + open.length;
  const to = from + textContent.length;
  editor.$view.dispatch({
    changes: {
      from: selectionRange.from,
      to: selectionRange.to,
      insert: template,
    },
  });
  setTimeout(() => {
    editor.$view.dispatch({
      selection: selection.replaceRange(EditorSelection.range(from, to)),
    });
  }, 100);
};
