/* eslint-disable @typescript-eslint/no-explicit-any */
import { isUndefined } from 'lodash-es';
import { type IFormSchema } from '@coze-workflow/test-run-next';

interface SetCacheValuesOptions {
  properties: IFormSchema['properties'];
  defaultValues: any;
  /** 是否强制使用 defaultValues 数据 */
  force?: boolean;
}

export const setDefaultValues = ({
  properties,
  defaultValues,
  force,
}: SetCacheValuesOptions) => {
  if (!properties) {
    return;
  }
  Object.keys(properties).forEach(key => {
    const field = properties[key];
    const value = defaultValues?.[key];
    if (field.type === 'object') {
      setDefaultValues({
        properties: field.properties,
        defaultValues: value,
        force,
      });
      return;
    }
    if (!isUndefined(value) || force) {
      field.defaultValue = value;
    }
  });
};
