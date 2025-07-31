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

import { type VariableItem, VariableKeyErrType } from '../types/skill';

export function uniqMemoryList(
  list: VariableItem[],
  sysVariables: VariableItem[] = [],
) {
  return list.map(i => {
    const res = { ...i };
    if (
      list.filter(j => j.key === i.key).length === 1 &&
      sysVariables.filter(v => v.key === i.key)?.length === 0
    ) {
      res.errType = VariableKeyErrType.KEY_CHECK_PASS;
    } else {
      res.errType = VariableKeyErrType.KEY_NAME_USED;
    }
    if (!i.key) {
      res.errType = VariableKeyErrType.KEY_IS_NULL;
    }
    return res;
  });
}
