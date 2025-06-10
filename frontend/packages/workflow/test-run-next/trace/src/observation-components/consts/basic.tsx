import { type Value, TagType } from '../typings/idl';

export enum StatusCode {
  SUCCESS = 0,
  ERROR = 1,
}

export const META_TAGS_VALUE_TYPE_MAP: Record<TagType, keyof Value> = {
  [TagType.STRING]: 'v_str',
  [TagType.DOUBLE]: 'v_double',
  [TagType.BOOL]: 'v_bool',
  [TagType.LONG]: 'v_long',
  [TagType.BYTES]: 'v_bytes',
};

export enum RegionMap {
  CN = 'cn',
  I18N = 'i18N',
}
