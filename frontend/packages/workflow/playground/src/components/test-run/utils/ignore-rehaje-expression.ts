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
 
import { isString } from 'lodash-es';

/**
 * ai 生成的值中可能包含 {{xxx}} 会命中 rehaje 的表达式
 * 暂时先做忽略，等更换完表单引擎即可解除问题
 */
export const ignoreRehajeExpressionString = (value: unknown) => {
  if (!isString(value)) {
    return value;
  }
  const reg = /\{\{.*\}\}/;
  return value.match(reg) ? undefined : value;
};
