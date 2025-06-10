import { themes } from '@flow-lang-sdk/editor/preset-code';

import { convertSchema } from './utils';
import { type PreviewerProps, type EditorProps } from './interface';
import { createDarkTheme } from './components/theme';
import { Previewer } from './components/previewer';
import { BizEditor as Editor } from './components/editor';

themes.register('code-editor-dark', createDarkTheme());

export {
  Previewer,
  Editor,
  type PreviewerProps,
  type EditorProps,
  convertSchema,
};
