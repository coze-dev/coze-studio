import { ViewVariableType } from '@coze-workflow/base';

// eslint-disable-next-line @typescript-eslint/naming-convention
export const ObjectLikeTypes = [
  ViewVariableType.Object,
  ViewVariableType.ArrayObject,
];

export enum ChangeMode {
  Update,
  Delete,
  Append,
  DeleteChildren,
}

export enum DescriptionLine {
  Single = 'singleline',
  Multi = 'multiline',
}

// 名称最长20字符
export const MAX_NAME_LENGTH = 20;
