import { ModelParamType } from '@coze-arch/bot-api/developer_api';

import { primitiveExhaustiveCheck } from '../exhaustive-check';

export interface ConvertedModelValueTypeMap {
  [ModelParamType.Boolean]: boolean;
  [ModelParamType.Float]: number;
  [ModelParamType.Int]: number;
  [ModelParamType.String]: string;
}

export function convertModelValueType(
  value: string,
  type: ModelParamType,
): ConvertedModelValueTypeMap[ModelParamType] {
  if (type === ModelParamType.Boolean) {
    return value === 'true';
  }

  if (type === ModelParamType.String) {
    return value;
  }

  if (type === ModelParamType.Float || type === ModelParamType.Int) {
    return Number(value);
  }

  // 理论上不走这里
  primitiveExhaustiveCheck(type);
  return value;
}
