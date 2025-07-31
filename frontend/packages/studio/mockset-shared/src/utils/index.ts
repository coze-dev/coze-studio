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

import type { JSONSchema7, JSONSchema7TypeName } from 'json-schema';
import {
  TrafficScene,
  type ComponentSubject,
} from '@coze-arch/bot-api/debugger_api';

import { type BizCtxInfo } from '../types/interface';
import {
  type MockDataWithStatus,
  MockDataValueType,
  MockDataStatus,
} from '../types';
import {
  FORMAT_SPACE_SETTING,
  STRING_DISPLAY_PREFIX,
  STRING_DISPLAY_SUFFIX,
} from '../constants';

function safeJSONParse<T>(str: string, errCb?: () => T | undefined) {
  try {
    return JSON.parse(str) as T;
  } catch (error) {
    return errCb?.();
  }
}

export function parseToolSchema(str: string) {
  return safeJSONParse<JSONSchema7>(str);
}

const ARRAY_PREFIX_KEY = 'item_';

export function getArrayItemKey(index: number | string) {
  return `${ARRAY_PREFIX_KEY}${index}`;
}
export const calcStringSize = (str: string) => {
  if (!str) {
    return 0;
  }
  const { size } = new Blob([str]);
  return size;
};
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- The type of the plugin resp is user-defined and contains any possible
type PluginRespType = any;
// Convert DataWithStatus format to Object format
export function transDataWithStatus2Object(
  data: MockDataWithStatus,
  excludeRemovedItem?: boolean,
) {
  if (data.status === MockDataStatus.REMOVED) {
    return {};
  }

  switch (data.type) {
    case MockDataValueType.ARRAY:
      return {
        [data.label]: data.children?.reduce((acc: PluginRespType[], item) => {
          const realValue = transDataWithStatus2Object(
            item,
            excludeRemovedItem,
          )[getArrayItemKey(0)];
          realValue !== undefined && acc.push(realValue);
          return acc;
        }, []),
      };
    case MockDataValueType.OBJECT:
      return {
        [data.label]: data.children?.reduce(
          (acc: Record<string, PluginRespType>, item) => {
            acc = {
              ...acc,
              ...transDataWithStatus2Object(item, excludeRemovedItem),
            };
            return acc;
          },
          {},
        ),
      };
    default:
      return {
        [data.label]: data.realValue,
      };
  }
}
export function getMockValue(
  type: MockDataValueType,
  fns: {
    getStringValue: () => string;
    getNumberValue: () => number;
    getBooleanValue: () => boolean;
  },
): [string | number | boolean | undefined, string | undefined] {
  switch (type) {
    case MockDataValueType.STRING: {
      const mockStr = fns.getStringValue();
      return [
        mockStr,
        `${STRING_DISPLAY_PREFIX}${mockStr}${STRING_DISPLAY_SUFFIX}`,
      ];
    }
    case MockDataValueType.BOOLEAN: {
      const mockBool = fns.getBooleanValue();
      return [mockBool, `${mockBool}`];
    }
    case MockDataValueType.NUMBER:
    case MockDataValueType.INTEGER: {
      const mockNum = fns.getNumberValue();
      return [mockNum, `${mockNum}`];
    }
    default:
      return [undefined, undefined];
  }
}

// Different types of generation logic when generating DataWithStatus from schema
function getInitialValue(
  type: MockDataValueType,
): [string | number | boolean | undefined, string | undefined] {
  return getMockValue(type, {
    getBooleanValue: () => false,
    getNumberValue: () => 0,
    getStringValue: () => '',
  });
}

function getSchemaType(type?: JSONSchema7TypeName | JSONSchema7TypeName[]) {
  const val = typeof type === 'object' ? type[0] : type;
  return val === 'null' ? undefined : (val as MockDataValueType);
}

// Convert schema format to DataWithStatus format (including initialization logic)
// eslint-disable-next-line complexity
export function transSchema2DataWithStatus(
  label: string,
  schema?: JSONSchema7,
  params?: {
    required?: string[];
    keyPrefix?: string;
    generateFn?: (
      type: MockDataValueType,
    ) => [string | number | boolean | undefined, string | undefined];
  },
): MockDataWithStatus | undefined {
  const dataTypeName = getSchemaType(schema?.type);

  if (!schema || !dataTypeName) {
    return undefined;
  }
  const { generateFn = getInitialValue } = params || {};
  const [realValue, displayValue] = generateFn(dataTypeName);
  const itemKey = params?.keyPrefix ? `${params?.keyPrefix}-${label}` : label;

  const item: MockDataWithStatus = {
    label,
    realValue,
    displayValue,
    description: schema.description,
    isRequired: params?.required?.includes(label) || false,
    type: dataTypeName,
    status: MockDataStatus.ADDED,
    key: itemKey,
  };

  if (dataTypeName === MockDataValueType.OBJECT) {
    const children: MockDataWithStatus[] = [];

    for (const property in schema.properties) {
      if (property && typeof schema.properties[property] === 'object') {
        const child = transSchema2DataWithStatus(
          property,
          schema.properties[property] as JSONSchema7,
          {
            required: schema.required,
            keyPrefix: itemKey,
            generateFn,
          },
        );
        child && children.push(child);
      }
    }

    item.children = children;
  }

  if (
    dataTypeName === MockDataValueType.ARRAY &&
    typeof schema.items === 'object'
  ) {
    const childrenSchema =
      schema.items instanceof Array ? schema.items[0] : schema.items;

    if (typeof childrenSchema === 'object') {
      item.childrenType = getSchemaType(childrenSchema.type);
      const child = transSchema2DataWithStatus(
        getArrayItemKey(0),
        childrenSchema as JSONSchema7,
        {
          required: schema.required,
          keyPrefix: itemKey,
          generateFn,
        },
      );
      child ? (item.children = [child]) : undefined;
    }
  }

  return item;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- The content structure depends on the user-defined plugin resp structure, including any possible
export function stringifyEditorContent(value: any) {
  return JSON.stringify(value, null, FORMAT_SPACE_SETTING);
}

export function getPluginInfo(
  bizCtx: BizCtxInfo,
  mockSubjectInfo: ComponentSubject,
): { spaceID?: string; pluginID?: string; toolID?: string } {
  const { bizSpaceID, ext, trafficScene } = bizCtx || {};
  const extMockSubjectInfo = safeJSONParse(ext?.mockSubjectInfo || '{}');
  const { componentID, parentComponentID } = mockSubjectInfo;
  switch (trafficScene) {
    case TrafficScene.CozeWorkflowDebug:
      return {
        spaceID: bizSpaceID,
        // @ts-expect-error - skip
        toolID: extMockSubjectInfo?.componentID,
        // @ts-expect-error - skip
        pluginID: extMockSubjectInfo?.parentComponentID,
      };
    case TrafficScene.CozeSingleAgentDebug:
    case TrafficScene.CozeMultiAgentDebug:
    case TrafficScene.CozeToolDebug:
    default:
      return {
        spaceID: bizSpaceID,
        toolID: componentID,
        pluginID: parentComponentID,
      };
  }
}

export function getMockSubjectInfo(
  bizCtx: BizCtxInfo,
  mockSubjectInfo: ComponentSubject,
) {
  const { ext, trafficScene } = bizCtx || {};
  const extMockSubjectInfo = safeJSONParse(ext?.mockSubjectInfo || '{}');
  switch (trafficScene) {
    case TrafficScene.CozeWorkflowDebug:
      return extMockSubjectInfo;
    case TrafficScene.CozeSingleAgentDebug:
    case TrafficScene.CozeMultiAgentDebug:
    case TrafficScene.CozeToolDebug:
    default:
      return mockSubjectInfo;
  }
}

export function getEnvironment() {
  if (!IS_PROD) {
    return 'cn-boe';
  }
  const regionPart = IS_OVERSEA ? 'oversea' : 'cn';
  const inhousePart = IS_RELEASE_VERSION ? 'release' : 'inhouse';

  return [regionPart, inhousePart].join('-');
}
