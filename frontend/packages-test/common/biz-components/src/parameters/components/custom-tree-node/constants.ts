import { ParamTypeAlias } from '../../types';

// eslint-disable-next-line @typescript-eslint/naming-convention
export const ObjectLikeTypes = [
  ParamTypeAlias.Object,
  ParamTypeAlias.ArrayObject,
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
