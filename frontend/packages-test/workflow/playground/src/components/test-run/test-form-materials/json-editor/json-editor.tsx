import { EditorProvider, createRenderer } from '@coze-editor/editor/react';
import preset, { languages, themes } from '@coze-editor/editor/preset-code';
import { json } from '@coze-editor/editor/language-json';
import { EditorView, tooltips } from '@codemirror/view';

import { cozeLight } from '../../../code-editor/themes/coze-light';
import { cozeDark } from '../../../code-editor/themes/coze-dark';

languages.register('json', json);
themes.register('coze-light', cozeLight);
themes.register('coze-dark', cozeDark);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const JSONEditor: any = createRenderer(preset, [
  EditorView.theme({
    '.cm-selectionBackground': {
      borderRadius: '4px',
    },
    '.cm-activeLineGutter': {
      borderRadius: '4px 0 0 4px',
    },
    '.cm-activeLine': {
      borderRadius: '0 4px 4px 0',
    },
    '&.cm-focused': {
      outline: 'none',
    },
    '& *': {
      fontFamily: 'Menlo, Monaco, "Courier New", monospace',
    },
    '.cm-tooltip': {
      wordBreak: 'break-all',
    },
    '.cm-lineNumbers .cm-gutterElement': {
      transform: 'translate(0, 1px)',
    },
    '.cm-foldGutter .cm-gutterElement > div': {
      display: 'flex',
      alignItems: 'center',
    },
    '.cm-completionIcon': {
      fontSize: '11px',
    },
  }),
  tooltips({
    parent: document.body,
    tooltipSpace() {
      return {
        left: 16,
        top: 16,
        right: window.innerWidth - 16,
        bottom: window.innerHeight - 16,
      };
    },
  }),
]);

export { EditorProvider, JSONEditor };
