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
    // 保留maxCount, 删除之后的内容
    delta.retain(maxCount).delete(sliceCount);
    editor.getContentState().apply(delta);
  }
};
