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
  type ObjectRefExpression,
  type InputValueVO,
  ValueExpressionType,
} from '@coze-workflow/base';

interface InputObjectRefVO extends InputValueVO {
  input: ObjectRefExpression;
}

/**
 * Is there a variable reference?
 * @param vos
 * @returns
 */
function hasRef(vos?: InputValueVO[]): boolean {
  if (!vos?.length) {
    return false;
  }

  return vos.some(
    vo => vo.input?.type === ValueExpressionType.REF || hasRef(vo.children),
  );
}

/**
 * Is it a static object ref?
 * Inside are the constants used
 */
export function isStaticObjectRef(value: InputObjectRefVO): boolean {
  const input = value?.input;

  if (input?.type !== ValueExpressionType.OBJECT_REF) {
    return false;
  }

  return !hasRef(value.children);
}
