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

import { isEqual } from 'lodash-es';
import { type JSONSchema7 } from 'json-schema';
import {
  ROOT_KEY,
  getArrayItemKey,
  transDataWithStatus2Object,
  transSchema2DataWithStatus,
} from '@coze-studio/mockset-shared';

import {
  getMergedDataWithStatus,
  mergeDataWithStatus,
  safeJSONParse,
  transMockData2DataWithStatus,
} from '../src/util/utils';
import {
  MockDataStatus,
  type MockDataValueType,
  type MockDataWithStatus,
} from '../src/util/typings';

const testSchema: JSONSchema7 = {
  $schema: 'https://json-schema.org/draft-07/schema',
  required: ['num', 'str', 'bool'],
  properties: {
    bool: {
      additionalProperties: false,
      type: ['boolean'],
    },
    int: {
      additionalProperties: false,
      type: ['integer'],
    },
    num: {
      additionalProperties: false,
      type: ['number'],
    },
    str: {
      additionalProperties: false,
      type: ['string'],
    },
  },
  additionalProperties: false,
  type: ['object'],
};

const testMockA: MockDataWithStatus = {
  children: [
    {
      description: undefined,
      displayValue: 'false',
      isRequired: true,
      key: 'mock-bool',
      label: 'bool',
      status: 'added' as MockDataStatus,
      type: 'boolean' as MockDataValueType,
      realValue: false,
    },
    {
      description: undefined,
      displayValue: '0',
      isRequired: false,
      key: 'mock-int',
      label: 'int',
      status: 'added' as MockDataStatus,
      type: 'integer' as MockDataValueType,
      realValue: 0,
    },
    {
      description: undefined,
      displayValue: '0',
      isRequired: true,
      key: 'mock-num',
      label: 'num',
      status: 'added' as MockDataStatus,
      type: 'number' as MockDataValueType,
      realValue: 0,
    },
    {
      description: undefined,
      displayValue: '""',
      isRequired: true,
      key: 'mock-str',
      label: 'str',
      status: 'added' as MockDataStatus,
      type: 'string' as MockDataValueType,
      realValue: '',
    },
  ],
  description: undefined,
  displayValue: undefined,
  isRequired: false,
  key: 'mock',
  label: 'mock',
  status: 'added' as MockDataStatus,
  type: 'object' as MockDataValueType,
  realValue: undefined,
};

const testMockAObj = { mock: { bool: false, int: 0, num: 0, str: '' } };

const testMockBStr = '{"bool":true,"num":2,"str":"hello","extra":"extra"}';

const testMockB: MockDataWithStatus = {
  key: 'mock',
  label: 'mock',
  realValue: undefined,
  displayValue: undefined,
  isRequired: false,
  type: 'object' as MockDataValueType,
  status: 'removed' as MockDataStatus,
  children: [
    {
      key: 'mock-bool',
      label: 'bool',
      realValue: true,
      displayValue: 'true',
      isRequired: false,
      type: 'boolean' as MockDataValueType,
      status: 'removed' as MockDataStatus,
    },
    {
      key: 'mock-num',
      label: 'num',
      realValue: 2,
      displayValue: '2',
      isRequired: false,
      type: 'number' as MockDataValueType,
      status: 'removed' as MockDataStatus,
    },
    {
      key: 'mock-str',
      label: 'str',
      realValue: 'hello',
      displayValue: '"hello"',
      isRequired: false,
      type: 'string' as MockDataValueType,
      status: 'removed' as MockDataStatus,
    },
    {
      key: 'mock-extra',
      label: 'extra',
      realValue: 'extra',
      displayValue: '"extra"',
      isRequired: false,
      type: 'string' as MockDataValueType,
      status: 'removed' as MockDataStatus,
    },
  ],
};

const testMergedMockData: MockDataWithStatus = {
  key: 'mock',
  label: 'mock',
  description: undefined,
  realValue: undefined,
  displayValue: undefined,
  isRequired: false,
  type: 'object' as MockDataValueType,
  status: 'added' as MockDataStatus,
  children: [
    {
      description: undefined,
      displayValue: 'true',
      isRequired: true,
      key: 'mock-bool',
      label: 'bool',
      status: 'default' as MockDataStatus,
      type: 'boolean' as MockDataValueType,
      realValue: true,
    },
    {
      description: undefined,
      displayValue: '0',
      isRequired: false,
      key: 'mock-int',
      label: 'int',
      status: 'added' as MockDataStatus,
      type: 'integer' as MockDataValueType,
      realValue: 0,
    },
    {
      description: undefined,
      displayValue: '2',
      isRequired: true,
      key: 'mock-num',
      label: 'num',
      status: 'default' as MockDataStatus,
      type: 'number' as MockDataValueType,
      realValue: 2,
    },
    {
      description: undefined,
      displayValue: '"hello"',
      isRequired: true,
      key: 'mock-str',
      label: 'str',
      status: 'default' as MockDataStatus,
      type: 'string' as MockDataValueType,
      realValue: 'hello',
    },
    {
      key: 'mock-extra',
      label: 'extra',
      realValue: 'extra',
      displayValue: '"extra"',
      isRequired: false,
      type: 'string' as MockDataValueType,
      status: 'removed' as MockDataStatus,
    },
  ],
};

describe('plugin-mock-data-utils', () => {
  it('getArrayItemKey', () => {
    const key = getArrayItemKey(1);

    expect(key).toEqual('item_1');
  });

  it('transSchema2DataWithStatus', () => {
    const data = transSchema2DataWithStatus(ROOT_KEY, testSchema);
    const compareResult = isEqual(data, testMockA);

    expect(compareResult).toEqual(true);
  });

  it('transDataWithStatus2Object', () => {
    const data = transDataWithStatus2Object(testMockA);
    const compareResult = isEqual(data, testMockAObj);

    expect(compareResult).toEqual(true);
  });

  it('transMockData2DataWithStatus', () => {
    const obj = safeJSONParse(testMockBStr);
    const parsedMockData = transMockData2DataWithStatus(ROOT_KEY, obj, {
      defaultStatus: MockDataStatus.REMOVED,
    });
    const compareResult = isEqual(parsedMockData, testMockB);

    expect(compareResult).toEqual(true);
  });

  it('mergeDataWithStatus', () => {
    const { merged: mergedMockData, incompatible } = mergeDataWithStatus(
      testMockA.children,
      testMockB.children,
    );
    const compareResult = isEqual(mergedMockData, testMergedMockData.children);

    expect(compareResult).toEqual(true);
    expect(incompatible).toEqual(true);
  });

  it('getMergedDataWithStatus', () => {
    const { result: mergedMockData, incompatible } = getMergedDataWithStatus(
      testMockA,
      testMockBStr,
    );

    const compareResult = isEqual(mergedMockData, testMergedMockData);

    expect(compareResult).toEqual(true);
    expect(incompatible).toEqual(true);
  });
});
