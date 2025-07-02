import { type ModelInfo } from '@coze-arch/bot-api/developer_api';

import { type NestedObject, flattenObject } from '../flatten-object';

export const convertModelInfoToFlatObject = (modelInfo: ModelInfo) =>
  flattenObject(modelInfo as NestedObject);
