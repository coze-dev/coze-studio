import { type Extension } from '@coze-common/editor-plugins/types';
import { EditorView } from '@codemirror/view';

export const defaultTheme: Extension = EditorView.theme({
  '.cm-content': {
    color: 'rgba(6, 7, 9, 0.80)',
  },
  '.cm-line': {
    lineHeight: '24px',
    paddingLeft: '12px',
  },
  '.cm-cursor': {
    height: '20px !important',
  },
});
