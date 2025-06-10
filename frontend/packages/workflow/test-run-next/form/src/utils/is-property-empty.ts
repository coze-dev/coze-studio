import { isObject } from 'lodash-es';

/**
 * 是否是空的 properties
 */
export const isFormSchemaPropertyEmpty = (properties: unknown) =>
  isObject(properties) ? !Object.keys(properties).length : true;
