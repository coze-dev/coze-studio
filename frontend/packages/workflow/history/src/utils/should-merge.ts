import { type OperationMeta } from '@flowgram-adapter/free-layout-editor';

export const shouldMerge: OperationMeta['shouldMerge'] = (_op, prev, element) =>
  !!(prev && Date.now() - element.getTimestamp() < 500);
