import type { RefObject } from 'react';

import type { Editor } from '@coze-common/md-editor-adapter';
import { md2html } from '@coze-common/md-editor-adapter';

export interface InitEditorByPrologueProps {
  prologue: string;
  editorRef: RefObject<Editor>;
}
export const initEditorByPrologue = (props: InitEditorByPrologueProps) => {
  const { prologue, editorRef } = props;
  const htmlContent = md2html(prologue);
  editorRef.current?.setHTML(htmlContent);
};
