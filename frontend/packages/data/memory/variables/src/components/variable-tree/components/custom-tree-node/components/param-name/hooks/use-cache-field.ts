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

import { useEffect, useRef } from 'react';

import { useFormApi } from '@coze-arch/coze-design';

import { type Variable } from '@/store';

export const useCacheField = (data: Variable) => {
  const formApi = useFormApi();

  const lastValidValueRef = useRef(data.name);

  useEffect(() => {
    const currentValue = formApi.getValue(`${data.variableId}.name`);
    if (currentValue) {
      lastValidValueRef.current = currentValue;
    } else if (lastValidValueRef.current) {
      formApi.setValue(`${data.variableId}.name`, lastValidValueRef.current);
    }
  }, [data.variableId]);
};
