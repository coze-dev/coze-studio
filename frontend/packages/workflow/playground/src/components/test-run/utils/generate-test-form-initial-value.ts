/*
 * Copyright 2025 coze-dev Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { get, isBoolean, isString, isUndefined } from 'lodash-es';
import { ViewVariableType } from '@coze-workflow/base';
import { IntelligenceType } from '@coze-arch/idl/intelligence_api';
import { typeSafeJSONParse } from '@coze-arch/bot-utils';

import type {
  TestFormSchema,
  FormDataType,
  TestFormField,
  TestFormDefaultValue,
} from '../types';
import { FieldName } from '../constants';
import { stringifyDefaultValue } from './stringify-value';
import { ignoreRehajeExpressionString } from './ignore-rehaje-expression';

const generateTestFormInitialValue = (
  fields: TestFormSchema['fields'],
  cacheData: FormDataType,
) => {
  if (!fields || !Array.isArray(fields) || !fields.length || !cacheData) {
    return undefined;
  }
  const initialValue = fields.reduce<undefined | FormDataType>(
    (previous, current) => {
      const { name, visible } = current;
      /** If it is an invalid item, no initial value is required for the time being */
      if (isBoolean(visible) && !visible) {
        return previous;
      }
      if (!name || current.type === 'FormVoid') {
        /** If name does not exist, it is a UI or virtual node, take its children to continue recursion, and expand the value tiled. */
        return {
          ...previous,
          ...generateTestFormInitialValue(current.children, cacheData),
        };
      }
      const data: FormDataType = get(cacheData, name);
      /** It means that it can be drilled. */
      if (current.children) {
        return {
          ...previous,
          [name]: generateTestFormInitialValue(current.children, data),
        };
      }
      /** Valid values depend on whether the values exist and whether the types match */
      const isUseValue =
        data?.type === current.originType && !isUndefined(data?.value);
      return isUseValue
        ? {
            ...previous,
            [name]: data.value,
          }
        : previous;
    },
    undefined,
  );

  return initialValue;
};

const generateCacheValues2InitialValue = (
  fields: TestFormSchema['fields'],
  cacheData: FormDataType,
  /** Whether to force the use of cacheData data */
  force?: boolean,
) => {
  if (!fields || !Array.isArray(fields) || !fields.length || !cacheData) {
    return;
  }
  fields.forEach(field => {
    const { name, visible, type, children, originType } = field;
    /** If it is an invalid item, no initial value is required for the time being */
    if (isBoolean(visible) && !visible) {
      return;
    }
    if (!name || type === 'FormVoid') {
      generateCacheValues2InitialValue(children, cacheData, force);
      return;
    }
    const data: FormDataType = get(cacheData, name);
    if (children) {
      generateCacheValues2InitialValue(children, data, force);
      return;
    }
    const initialValue = ignoreRehajeExpressionString(data?.value);
    if ((data?.type === originType && !isUndefined(initialValue)) || force) {
      field.initialValue = initialValue;
    }
  });
};

const generateCacheDataType = (
  fields: TestFormSchema['fields'],
  cacheData: FormDataType,
  blacks: string[] = [],
) => {
  if (!fields || !Array.isArray(fields) || !fields.length || !cacheData) {
    return undefined;
  }
  const data = fields.reduce<undefined | FormDataType>((previous, current) => {
    const { name } = current;

    if (!name || current.type === 'FormVoid') {
      return {
        ...previous,
        ...generateCacheDataType(current?.children, cacheData),
      };
    }
    // Fields in the blacklist do not need to be saved
    if (blacks.includes(name)) {
      return previous;
    }
    if (current.children) {
      return {
        ...previous,
        [name]: generateCacheDataType(current?.children, cacheData?.[name]),
      };
    }
    const value = cacheData?.[name];
    const type = current.originType;
    return isUndefined(value)
      ? previous
      : {
          ...previous,
          [name]: {
            type,
            value,
          },
        };
  }, undefined);

  return data;
};

const transformDefaultValueToFormData = (
  defaultValue: TestFormDefaultValue,
) => {
  const { input, bot_id, batch } = defaultValue;

  return {
    [FieldName.Node]: {
      [FieldName.Input]: stringifyDefaultValue(input as object),
      [FieldName.Batch]: stringifyDefaultValue(batch as object),
    },
    [FieldName.Bot]: bot_id,
  };
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const formatObjectValue = (field: TestFormField, data: any) => {
  if (!field.originType || !isString(data)) {
    return data;
  }
  if (ViewVariableType.isFileType(field.originType)) {
    return data;
  }
  if (
    ViewVariableType.isArrayType(field.originType) ||
    ViewVariableType.Object === field.originType
  ) {
    try {
      return JSON.stringify(JSON.parse(data), undefined, 2);
    } catch {
      return data;
    }
  }
  // If no conditions are met, it is also returned directly as the bottom line value.
  return data;
};
const generateHistoryValues2InitialValue = (
  fields: TestFormSchema['fields'],
  historyValuesStr: string,
) => {
  if (!historyValuesStr) {
    return;
  }
  const input = stringifyDefaultValue(
    typeSafeJSONParse(historyValuesStr || '{}') as Record<string, string>,
  );
  if (!input) {
    return;
  }
  const nodeField = fields.find(i => i.name === FieldName.Node);
  if (!nodeField || !nodeField.children?.length) {
    return;
  }
  const inputField = nodeField.children.find(i => i.name === FieldName.Input);
  if (!inputField || !inputField.children?.length) {
    return;
  }
  inputField.children.forEach(i => {
    const { name } = i;
    const data = ignoreRehajeExpressionString(input[name]);
    if (!isUndefined(data)) {
      i.initialValue = formatObjectValue(i, data);
    }
  });
};

const generateCaseData2InitialValue = (
  fields: TestFormSchema['fields'],
  caseData?: Record<string, unknown>,
) => {
  if (!caseData) {
    return;
  }
  const nodeField = fields.find(i => i.name === FieldName.Node);
  if (!nodeField || !nodeField.children?.length) {
    return;
  }
  const inputField = nodeField.children.find(i => i.name === FieldName.Input);
  if (!inputField || !inputField.children?.length) {
    return;
  }
  inputField.children.forEach(i => {
    const { name } = i;
    const data = caseData[name];
    if (!isUndefined(data)) {
      i.initialValue = formatObjectValue(i, data);
    }
  });
};

const generateRelatedBot2InitialValue = (
  fields: TestFormSchema['fields'],
  data?: { id?: string; type?: string },
) => {
  if (!data?.id || !data?.type) {
    return;
  }

  const nodeField = fields.find(i => i.name === FieldName.Bot);
  if (!nodeField || !nodeField.children?.length) {
    return;
  }

  const botField = nodeField.children.find(i => i.name === FieldName.Bot);
  if (!botField) {
    return;
  }

  botField.initialValue = {
    id: data.id,
    type:
      data.type === 'project' ? IntelligenceType.Project : IntelligenceType.Bot,
  };
};

export {
  generateTestFormInitialValue,
  generateCacheDataType,
  transformDefaultValueToFormData,
  generateCacheValues2InitialValue,
  generateHistoryValues2InitialValue,
  generateCaseData2InitialValue,
  generateRelatedBot2InitialValue,
};
