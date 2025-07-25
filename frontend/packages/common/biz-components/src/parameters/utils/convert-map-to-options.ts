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
 
import { isFunction } from 'lodash-es';

/**
 * 将 { value: label } 形式的结构体转成Select需要的options Array<{ label, value }>
 *   computedValue：将value值转化一次作为options的value
 *   passItem：判断当前value值是否需要跳过遍历
 */
export default function convertMaptoOptions<Value = number>(
  map: Record<string, unknown>,
  convertOptions: {
    computedValue?: (val: unknown) => Value;
    passItem?: (val: unknown) => boolean;
    /**
     * 由于 i18n 的实现方式问题，写成常量的文案需要惰性加载
     * 因此涉及到 i18n 的 { value: label } 结构一律需要写成 { value: () => label }
     * 该属性启用时，会额外进行一次惰性加载
     * @default false
     * @link 
     */
    i18n?: boolean;
  } = {},
) {
  const res: Array<{ label: string; value: Value }> = [];
  for (const [value, label] of Object.entries(map)) {
    const pass = convertOptions.passItem
      ? convertOptions.passItem(value)
      : false;
    if (pass) {
      continue;
    }
    const computedValue = convertOptions.computedValue
      ? convertOptions.computedValue(value)
      : (value as Value);

    const finalLabel: string = convertOptions.i18n
      ? isFunction(label)
        ? label()
        : label
      : label;
    res.push({ label: finalLabel, value: computedValue });
  }
  return res;
}
