import type { TypeOf } from 'io-ts';

import {
  type datasetNodeActualDataRuntimeType,
  type datasetNodeFormDataRuntimeType,
} from './runtime-type';

export type DatasetNodeActualData = TypeOf<
  typeof datasetNodeActualDataRuntimeType
>;
export type DatasetNodeFormData = TypeOf<typeof datasetNodeFormDataRuntimeType>;
