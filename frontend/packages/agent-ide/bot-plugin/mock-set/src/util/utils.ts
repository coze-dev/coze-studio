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

// 仅开发中使用
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

// 根据 value 生成 displayValue
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- plugin resp 的类型由用户定义，包含任何可能
type PluginRespType = any;

// 合并 schema 和 mock data
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

  // 将 mock 转换为 MockDataWithStatus 格式
  const processedMock = transMockData2DataWithStatus(ROOT_KEY, mock, {
    defaultStatus: MockDataStatus.REMOVED,
  });

  // 合并
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

// 解析当前 realValue 所属于的 MockDataValueType
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
  // mock data 的类型是根据值识别出的，存在 Integer 类型被识别为 Number 的情况
  if (mockDataType === MockDataValueType.NUMBER) {
    return (
      initDataType === MockDataValueType.NUMBER ||
      initDataType === MockDataValueType.INTEGER
    );
  } else {
    return mockDataType === initDataType;
  }
}

// 转换 Object 格式到 DataWithStatus 格式
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

  // 在合并 array 时，会出现 autoInitDataList(originData) 中只存在一个初始化数据，而 mockDataListWithStatus(appendData) 存在多个相同结构的数据
  // 需要将 mockDataListWithStatus 中剩余的数据进行合入
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

// 合并两个 MockDataWithStatus 数组，以 autoInitDataList 顺序优先
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

  // 在合并 array 时，存在 mockDataListWithStatus 为空的情况，此时直接判断
  if (mockDataListWithStatus.length === 0 && isArrayType) {
    return {
      merged: [],
      incompatible: false,
    };
  }

  return merge2DataList(autoInitDataList, mockDataListWithStatus, isArrayType);
}
