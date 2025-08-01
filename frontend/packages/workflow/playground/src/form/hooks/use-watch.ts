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

import { useWatch as useBaseWatch } from '@flowgram-adapter/free-layout-editor';

import { type FieldName } from '../type';

/**
 * Monitors the value of the specified field.
 *
 * @Param name field name.
 * @Returns the value of the field.
 */
export function useWatch<Value = unknown>(
  name: FieldName | { name: FieldName },
) {
  const value = useBaseWatch(
    typeof name === 'string' ? name : name.name,
  ) as Value;

  return value;
}
