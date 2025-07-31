/*
 * Copyright 2025 coze-dev Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/* eslint-disable @typescript-eslint/naming-convention -- todo */
/** Remarks Default size */
export const CommentDefaultSize = {
  width: 240,
  height: 150,
};

/** Remarks Default value */
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
