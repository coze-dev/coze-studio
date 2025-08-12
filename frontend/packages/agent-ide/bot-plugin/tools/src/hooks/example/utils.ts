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

import { nanoid } from 'nanoid';
import { get } from 'lodash-es';
import {
  ParameterType,
  type APIParameter,
} from '@coze-arch/bot-api/plugin_develop';

export const typesConfig = {
  string: ParameterType.String,
  integer: ParameterType.Integer,
  number: ParameterType.Number,
  object: ParameterType.Object,
  array: ParameterType.Array,
  bool: ParameterType.Bool,
  list: ParameterType.Array,
  float: ParameterType.Number,
  boolean: ParameterType.Bool,
};

// Tool data recall
interface ExampleReqParamsType {
  [key: string]: string | number | null | object | boolean;
}
export const setEditToolExampleValue = (
  requestParams: APIParameter[],
  exampleReqParams: ExampleReqParamsType[],
) => {
  // @ts-expect-error -- linter-disable-autofix
  const setDefault = (originData: APIParameter[], currentJsonData) => {
    originData.forEach((paramItem: APIParameter) => {
      const currentPathValue = get(currentJsonData, paramItem?.name ?? '');
      if (currentPathValue !== undefined) {
        if (paramItem.type === ParameterType.Object) {
          setDefault(paramItem.sub_parameters ?? [], currentPathValue);
        } else if (paramItem.type === ParameterType.Array) {
          paramItem.global_default = JSON.stringify(currentPathValue);
        } else {
          paramItem.global_default = currentPathValue;
        }
      }
    });
  };
  setDefault(requestParams, exampleReqParams);
};

// Resettype is_required sub_parameters
// @ts-expect-error -- linter-disable-autofix
export const resetWorkflowKey = currentTarget => {
  if (Array.isArray(currentTarget)) {
    currentTarget.forEach(obj => {
      resetWorkflowKey(obj);
    });
  } else {
    // @ts-expect-error -- linter-disable-autofix
    currentTarget.type = typesConfig[currentTarget.type];
    // @ts-expect-error -- linter-disable-autofix
    currentTarget.sub_type = typesConfig[currentTarget.sub_type];
    currentTarget.is_required = currentTarget.required;
    currentTarget.global_disable = false;
    currentTarget.local_disable = false;
    currentTarget.location = undefined;
    currentTarget.id = nanoid();
    currentTarget.desc = currentTarget.description;

    if ('schema' in currentTarget) {
      if (currentTarget.type === ParameterType.Array) {
        currentTarget.sub_parameters = [
          {
            name: '[Array Item]',
            is_required: currentTarget.required,
            // @ts-expect-error -- linter-disable-autofix
            type: typesConfig[currentTarget.schema?.type],
            global_disable: false,
            local_disable: false,
            location: undefined,
            sub_type: 0,
            sub_parameters: currentTarget.schema?.schema ?? [],
          },
        ];
      } else if (currentTarget.type === ParameterType.Object) {
        currentTarget.sub_parameters = [...currentTarget.schema];
      } else {
        currentTarget.sub_parameters = [];
      }
    } else {
      currentTarget.sub_parameters = [];
    }
    resetWorkflowKey(
      currentTarget.type === ParameterType.Array
        ? currentTarget.sub_parameters[0].sub_parameters
        : currentTarget?.sub_parameters,
    );
  }
};

// @ts-expect-error -- linter-disable-autofix
export const resetStoreKey = currentTarget => {
  if (Array.isArray(currentTarget)) {
    currentTarget.forEach(obj => {
      resetStoreKey(obj);
    });
  } else {
    // @ts-expect-error -- linter-disable-autofix
    currentTarget.type = typesConfig[currentTarget.type];
    // @ts-expect-error -- linter-disable-autofix
    currentTarget.sub_type = typesConfig[currentTarget.sub_type];
    currentTarget.is_required = currentTarget.required;
    currentTarget.global_disable = false;
    currentTarget.local_disable = false;
    currentTarget.location = undefined;
    currentTarget.id = nanoid();
    // The store over there is sub_params field, personal, sub_parameters
    if (!('sub_parameters' in currentTarget)) {
      currentTarget.sub_parameters = [];
    }
    if ('sub_params' in currentTarget) {
      currentTarget.sub_parameters = currentTarget.sub_params;
    }
    if (currentTarget.type === ParameterType.Array) {
      currentTarget.sub_parameters = [
        {
          name: '[Array Item]',
          is_required: currentTarget.required,
          type: currentTarget.sub_type,
          global_disable: false,
          local_disable: false,
          location: undefined,
          sub_type: 0,
          sub_parameters: [...currentTarget.sub_parameters],
        },
      ];
      resetStoreKey(currentTarget.sub_parameters[0].sub_parameters);
    } else {
      resetStoreKey(currentTarget.sub_parameters);
    }
  }
};

export const setStoreExampleValue = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  requestParams: any,
  exampleReqParams: ExampleReqParamsType[],
) => {
  resetStoreKey(requestParams);
  setEditToolExampleValue(requestParams, exampleReqParams);
};

export const setWorkflowExampleValue = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  requestParams: any,
  exampleReqParams: ExampleReqParamsType[],
) => {
  resetWorkflowKey(requestParams);
  setEditToolExampleValue(requestParams, exampleReqParams);
};
