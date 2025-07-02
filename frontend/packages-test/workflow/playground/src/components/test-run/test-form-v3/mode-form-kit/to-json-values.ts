/* eslint-disable @typescript-eslint/no-explicit-any */
import { get, set } from 'lodash-es';
import {
  type IFormSchema,
  TestFormFieldName,
} from '@coze-workflow/test-run-next';

import { visitNodeLeaf } from './visit-node-leaf';
import { getJsonModeFieldDefaultValue } from './get-json-mode-field-default-value';

export const toJsonValues = (
  schema: IFormSchema,
  values?: Record<string, any>,
) => {
  if (!values) {
    return values;
  }
  const jsonValue = get(values, TestFormFieldName.Node);
  /** 如果无法正常解析，也直接忽略 */
  if (!jsonValue) {
    return values;
  }
  const formatJsonValue: Record<string, any> = {};
  const nodeFieldProperties =
    schema.properties?.[TestFormFieldName.Node]?.properties;
  visitNodeLeaf(nodeFieldProperties, (groupKey, key, field) => {
    const groupValues = formatJsonValue[groupKey] || {};
    groupValues[key] = getJsonModeFieldDefaultValue(
      field['x-origin-type'] as any,
      get(jsonValue, [groupKey, key]),
    );
    formatJsonValue[groupKey] = groupValues;
  });
  set(values, TestFormFieldName.Node, {
    [TestFormFieldName.JSON]: JSON.stringify(formatJsonValue, undefined, 2),
  });
  return values;
};
