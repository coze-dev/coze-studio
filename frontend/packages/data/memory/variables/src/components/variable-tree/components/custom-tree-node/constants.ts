import { ViewVariableType } from '@/store';

export enum ChangeMode {
  Update,
  Delete,
  Append,
  UpdateEnabled,
  Replace,
}

// JSON类型
// eslint-disable-next-line @typescript-eslint/naming-convention
export const JSONLikeTypes = [
  ViewVariableType.Object,
  ViewVariableType.ArrayObject,
  ViewVariableType.ArrayBoolean,
  ViewVariableType.ArrayNumber,
  ViewVariableType.ArrayString,
  ViewVariableType.ArrayInteger,
];
