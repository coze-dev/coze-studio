/* eslint-disable @typescript-eslint/naming-convention -- todo */
/** 备注默认尺寸 */
export const CommentDefaultSize = {
  width: 240,
  height: 150,
};

/** 备注默认值 */
export const CommentDefaultNote = JSON.stringify([
  {
    type: 'paragraph',
    children: [{ text: '' }],
  },
]);

export const CommentDefaultSchemaType = 'slate';

export const CommentDefaultVO = {
  schemaType: CommentDefaultSchemaType,
  note: CommentDefaultNote,
  size: CommentDefaultSize,
};

export const CommentDefaultDTO = {
  inputs: {
    schemaType: CommentDefaultSchemaType,
    note: CommentDefaultNote,
  },
  size: CommentDefaultSize,
};
