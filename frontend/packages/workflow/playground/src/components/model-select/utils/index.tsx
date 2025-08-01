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

import { GenerationDiversity } from '@coze-workflow/base';
import {
  type ModelParameter,
  ModelParamType,
} from '@coze-arch/bot-api/developer_api';

export const getCamelNameName = name =>
  name
    .split('_')
    .map((s, i) => (i === 0 ? s : s.slice(0, 1).toUpperCase() + s.slice(1)))
    .join('');

export const getValueByType = <T,>(value, type?: ModelParamType): T => {
  const isNumber =
    type && [ModelParamType.Float, ModelParamType.Int].includes(type);
  const _value = isNumber && value ? Number(value) : value;
  return _value;
};

// memory level cache
const cacheData: {
  [k: string]: unknown;
} = {
  //Record expanded/stowed status
  expand: undefined,
};
export { cacheData };

/**
 * Generate default values from modelParams
 * If you pass in value, use value first (it can be understood as a min max check for value)
 */
export const generateDefaultValueByMeta = ({
  modelParams,
  value,
}: {
  modelParams?: ModelParameter[];
  value?: object;
}): Record<GenerationDiversity, object> => {
  const _defaultValue: Record<GenerationDiversity, object> = {
    [GenerationDiversity.Creative]: {},
    [GenerationDiversity.Balance]: {},
    [GenerationDiversity.Precise]: {},
    [GenerationDiversity.Customize]: {},
  };

  Object.keys(_defaultValue).forEach(generationDiversity => {
    _defaultValue[generationDiversity] = {};
    modelParams?.forEach(p => {
      const key = getCamelNameName(p.name ?? '');

      // Priority is given to taking from the value, and if you can't get it, you can take it from the meta. [Custom] The default value is the bottom.
      let _v =
        value?.[key] ??
        p.default_val?.[generationDiversity] ??
        p.default_val?.[GenerationDiversity.Customize];

      // Defense code: This is to verify that the backend returns the default value. Theoretically, the default value must be legal, but what if. The default value of the number type needs to be guaranteed max > = v > = min.
      if (
        p.type &&
        [ModelParamType.Float, ModelParamType.Int].includes(p.type)
      ) {
        const { min, max } = p;

        // For numeric types, if you really can't get the value, use 0.
        if (['', undefined].includes(_v)) {
          _v = 0;
        }

        if (min !== '' && Number(_v) < Number(min)) {
          _v = Number(min);
        }

        if (max !== '' && Number(_v) > Number(max)) {
          _v = Number(max);
        }
      }

      _defaultValue[generationDiversity][key] = _v;
    });
  });

  return _defaultValue;
};
