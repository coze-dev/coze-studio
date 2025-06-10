import { isString } from 'lodash-es';

export const safeFormatJsonString = (val: unknown): any => {
  if (!isString(val)) {
    return val;
  }
  try {
    return JSON.stringify(JSON.parse(val), null, 2);
  } catch {
    return val;
  }
};
