import { isBoolean } from 'lodash-es';

export const stringifyFormValuesFromBacked = (value: object) => {
  if (!value) {
    return undefined;
  }
  return Object.keys(value).reduce((acc, key) => {
    const val = value[key];
    if (val === null || val === undefined) {
      acc[key] = undefined;
    } else if (typeof val === 'string' || isBoolean(val)) {
      acc[key] = val;
    } else {
      acc[key] = JSON.stringify(value[key]);
    }
    return acc;
  }, {});
};
