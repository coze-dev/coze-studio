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

/* eslint-disable @typescript-eslint/no-explicit-any */
import { type Delta, type Editor } from './types';

/**
 * Empty implementation for open-closed source unification
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
