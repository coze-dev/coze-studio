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
  ModelParamType,
  type ModelParameter,
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

// 内存级缓存
const cacheData: {
  [k: string]: unknown;
} = {
  //记录展开/收起状态
  expand: undefined,
};
export { cacheData };

/**
 * 根据 modelParams 生成默认值
 * 如果传入 value 则优先使用 value（可以理解为对 value 做 min max 校验）
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

      // 优先从 value 中取，取不到再从 meta 里取。【自定义】默认值兜底
      let _v =
        value?.[key] ??
        p.default_val?.[generationDiversity] ??
        p.default_val?.[GenerationDiversity.Customize];

      // 防御代码：这里是为了校验后端返回默认值，理论上默认值必须合法，但万一呢。数字类型的默认值需要保证 max >= v >= min
      if (
        p.type &&
        [ModelParamType.Float, ModelParamType.Int].includes(p.type)
      ) {
        const { min, max } = p;

        // 数字类型的，实在取不到值了就用 0
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
