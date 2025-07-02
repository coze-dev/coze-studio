import { type OperationMeta } from '@flowgram-adapter/free-layout-editor';

import { addNodeOperationMeta } from './add-node';
import { addLineOperationMeta } from './add-line';

export const operationMetas: OperationMeta[] = [
  addNodeOperationMeta,
  addLineOperationMeta,
];
