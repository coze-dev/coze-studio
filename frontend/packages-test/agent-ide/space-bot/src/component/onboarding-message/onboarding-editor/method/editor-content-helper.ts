import { DEFAULT_ZONE } from '@coze-common/md-editor-adapter';
import type { Editor } from '@coze-common/md-editor-adapter';

const countTextLines = (text: string) => text.split('\n').length;

export const getEditorLines = (editor: Editor) =>
  editor.getContentState().getZoneState(DEFAULT_ZONE)?.length() ?? 0;

export const removeLastLineMarkerOnChange = ({
  text,
  editorLines,
}: {
  text: string;
  editorLines: number;
}) => {
  if (countTextLines(text) > editorLines && text.endsWith('\n')) {
    return text.slice(0, -1);
  }
  return text;
};
