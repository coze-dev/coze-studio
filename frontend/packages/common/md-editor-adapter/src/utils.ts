/* eslint-disable @typescript-eslint/no-explicit-any */
import { type Delta, type Editor } from './types';

/**
 * 空实现，用于开闭源统一
 * @param md
 * @returns
 */
export const md2html = (md: string) => md;

export const delta2md = (
  delta: Delta,
  zoneDelta: unknown,
  ignoreAttr = false,
) => ({
  markdown: delta.insert,
  images: [],
  links: [],
  mentions: [],
  codeblocks: [],
});

export const checkAndGetMarkdown = ({
  editor,
}: {
  editor: Editor;
  validate: boolean;
  onImageUploadProgress?: any;
}) => ({
  content: editor.getText(),
  images: [],
  links: [],
});
/* eslint-disable @typescript-eslint/no-explicit-any */
export const normalizeSchema = (input: any): any => ({
  '0': {
    zoneType: input[0]?.zoneType,
    zoneId: input[0]?.zoneId,
    ops: input[0]?.ops,
  },
});
