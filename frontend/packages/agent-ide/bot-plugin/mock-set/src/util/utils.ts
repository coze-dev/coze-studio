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

import {
  getArrayItemKey,
  getMockValue,
  ROOT_KEY,
} from '@coze-studio/mockset-shared';

import {
  MockDataStatus,
  MockDataValueType,
  type MockDataWithStatus,
} from './typings';
export function transUpperCase(str?: string) {
  return str ? `${str.slice(0, 1).toUpperCase()}${str.slice(1)}` : '';
}

// Only used in development
export function sleep(t = 1000) {
  return new Promise(r => {
    setTimeout(() => {
      r(1);
    }, t);
  });
}

export function safeJSONParse<T>(str: string, errCb?: () => T | undefined) {
  try {
    return JSON.parse(str) as T;
  } catch (error) {
    return errCb?.();
  }
}

// Generate displayValue from value
function getTargetValue(
  type: MockDataValueType,
  value: string | number | boolean | undefined,
): [string | number | boolean | undefined, string | undefined] {
  return getMockValue(type, {
    getBooleanValue: () => Boolean(value),
    getNumberValue: () => Number(value),
    getStringValue: () => String(value),
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- The type of the plugin resp is user-defined and contains any possible
type PluginRespType = any;

// Merge schema and mock data
export function getMergedDataWithStatus(
  schemaData?: MockDataWithStatus,
  currentMock?: string,
): {
  result?: MockDataWithStatus;
  incompatible: boolean;
} {
  const isInit = currentMock === undefined;

  if (!schemaData || isInit) {
    return {
      result: schemaData,
      incompatible: false,
    };
  }

  // parse mock string
  const mock =
    typeof currentMock === 'string'
      ? safeJSONParse<PluginRespType>(currentMock) || currentMock
      : currentMock;

  // Convert mock to MockDataWithStatus format
  const processedMock = transMockData2DataWithStatus(ROOT_KEY, mock, {
    defaultStatus: MockDataStatus.REMOVED,
  });

  // merge
  const { merged, incompatible } = mergeDataWithStatus(
    schemaData.children,
    processedMock?.children,
    schemaData.type === MockDataValueType.ARRAY,
  );

  return {
    result: {
      ...schemaData,
      children: merged,
    },
    incompatible,
  };
}

// Parse the MockDataValueType to which the current realValue belongs
function getMockDataType(currentMock: PluginRespType) {
  let dataTypeName = typeof currentMock as MockDataValueType | undefined;
  if (currentMock instanceof Array) {
    dataTypeName = MockDataValueType.ARRAY;
  }
  return dataTypeName;
}

function compareMockDataType(
  mockDataType?: MockDataValueType,
  initDataType?: MockDataValueType,
) {
  // The type of mock data is recognized by value, and there are cases where the Integer type is recognized as Number.
  if (mockDataType === MockDataValueType.NUMBER) {
    return (
      initDataType === MockDataValueType.NUMBER ||
      initDataType === MockDataValueType.INTEGER
    );
  } else {
    return mockDataType === initDataType;
  }
}

// Convert Object format to DataWithStatus format
export function transMockData2DataWithStatus(
  label: string,
  currentMock: PluginRespType,
  params?: {
    defaultStatus: MockDataStatus;
    keyPrefix?: string;
  },
): MockDataWithStatus | undefined {
  const { defaultStatus = MockDataStatus.DEFAULT } = params || {};
  const dataTypeName = getMockDataType(currentMock);

  if (!dataTypeName) {
    return undefined;
  }

  const [realValue, displayValue] = getTargetValue(dataTypeName, currentMock);

  const itemKey = params?.keyPrefix ? `${params?.keyPrefix}-${label}` : label;

  const item: MockDataWithStatus = {
    label,
    realValue,
    displayValue,
    isRequired: false,
    type: dataTypeName,
    status: defaultStatus,
    key: itemKey,
  };

  if (dataTypeName === MockDataValueType.OBJECT) {
    const children: MockDataWithStatus[] = [];
    for (const property of Object.keys(currentMock)) {
      if (property) {
        const child = transMockData2DataWithStatus(
          property,
          currentMock[property],
          {
            defaultStatus,
            keyPrefix: itemKey,
          },
        );
        child && children.push(child);
      }
    }

    item.children = children;
  }

  if (dataTypeName === MockDataValueType.ARRAY) {
    item.childrenType = getMockDataType(currentMock[0]);
    const children: MockDataWithStatus[] = [];

    for (const index in currentMock) {
      if (currentMock[index] !== undefined) {
        const child = transMockData2DataWithStatus(
          getArrayItemKey(index),
          currentMock[index],
          {
            defaultStatus,
            keyPrefix: itemKey,
          },
        );
        child && children.push(child);
      }
    }
    item.children = children;
  }

  return item;
}

function mergeDataItems(item1: MockDataWithStatus, item2: MockDataWithStatus) {
  let incompatible = false;
  const newItem = {
    ...item1,
    key: item2.key,
    label: item2.label,
    realValue: item2.realValue,
    displayValue: item2.displayValue,
    status: MockDataStatus.DEFAULT,
  };
  if (
    item2.type === MockDataValueType.ARRAY ||
    item2.type === MockDataValueType.OBJECT
  ) {
    const { merged, incompatible: childIncompatible } = mergeDataWithStatus(
      item1.children,
      item2.children,
      item1.type === MockDataValueType.ARRAY,
    );
    newItem.children = merged;
    incompatible = incompatible || childIncompatible;
  }
  return {
    result: newItem,
    incompatible,
  };
}

function merge2DataList(
  autoInitDataList: MockDataWithStatus[],
  mockDataListWithStatus: MockDataWithStatus[],
  isArrayType = false,
): {
  merged: MockDataWithStatus[];
  incompatible: boolean;
} {
  let incompatible = false;
  let appendData: MockDataWithStatus[] = [...mockDataListWithStatus];
  const originData: MockDataWithStatus[] = [...autoInitDataList];

  for (const i in originData) {
    if (originData[i]) {
      const item = originData[i];
      const index = appendData.findIndex(
        data =>
          data.label === item.label &&
          compareMockDataType(data.type, item.type) &&
          compareMockDataType(data.childrenType, item.childrenType),
      );
      if (index !== -1) {
        const data = appendData.splice(index, 1);
        const { result: newItem, incompatible: childIncompatible } =
          mergeDataItems(item, data[0]);
        originData[i] = newItem;
        incompatible = incompatible || childIncompatible;
      } else if (item.isRequired) {
        incompatible = true;
      }
    }
  }

  // When combining arrays, it appears that only one initialization data exists in autoInitDataList (originData), while mockDataListWithStatus (appendData) has multiple data of the same structure
  // The remaining data in the mockDataListWithStatus needs to be incorporated
  if (appendData.length && isArrayType) {
    const target = autoInitDataList[0];
    appendData.forEach(item => {
      const { result: newItem, incompatible: childIncompatible } =
        mergeDataItems(target, item);
      originData.push(newItem);
      incompatible = incompatible || childIncompatible;
    });
    appendData = [];
  }

  if (appendData.length) {
    incompatible = true;
  }

  return {
    merged: [...originData, ...appendData],
    incompatible,
  };
}

// Merge two MockDataWithStatus arrays, in autoInitDataList order first
export function mergeDataWithStatus(
  autoInitDataList?: MockDataWithStatus[],
  mockDataListWithStatus?: MockDataWithStatus[],
  isArrayType = false,
): {
  merged: MockDataWithStatus[];
  incompatible: boolean;
} {
  if (autoInitDataList === undefined || mockDataListWithStatus === undefined) {
    return {
      merged: [...(autoInitDataList || []), ...(mockDataListWithStatus || [])],
      incompatible: autoInitDataList !== mockDataListWithStatus,
    };
  }

  // When merging the array, there is a situation where the mockDataListWithStatus is empty. At this time, it is directly judged
  if (mockDataListWithStatus.length === 0 && isArrayType) {
    return {
      merged: [],
      incompatible: false,
    };
  }

  return merge2DataList(autoInitDataList, mockDataListWithStatus, isArrayType);
}
