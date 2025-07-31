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

import type { RefObject } from 'react';

import { ZoneDelta } from '@coze-common/md-editor-adapter';
import { type Editor } from '@coze-common/md-editor-adapter';

export const sliceEditor = (editorRef: RefObject<Editor>, maxCount: number) => {
  if (!editorRef.current) {
    return;
  }
  const editor = editorRef.current;
  const range = editor.selection.getSelection();
  const { start } = range;
  const zone = start.zoneId;
  const contentState = editor.getContentState();
  const zoneState = contentState.getZoneState(zone);
  if (!zoneState) {
    return;
  }
  const currentCount = zoneState.totalWidth() - 1;
  const sliceCount = currentCount - maxCount;
  if (sliceCount > 0) {
    const delta = new ZoneDelta({ zoneId: zone });
    // Keep maxCount, delete the content
    delta.retain(maxCount).delete(sliceCount);
    editor.getContentState().apply(delta);
  }
};
