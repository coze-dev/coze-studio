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

import { ConditionLogic } from '@coze-workflow/base';

import { useCurrentDatabaseQuery } from '@/hooks';
import { useForm } from '@/form';

export function useResetCondition(conditionFieldName: string) {
  const form = useForm();
  const { data: currentDatabase } = useCurrentDatabaseQuery();

  return () => {
    // There is currently a selected database, and an empty condition is required.
    if (currentDatabase) {
      form.setFieldValue(conditionFieldName, {
        conditionList: [
          { left: undefined, operator: undefined, right: undefined },
        ],
        logic: ConditionLogic.AND,
      });
    } else {
      form.setFieldValue(conditionFieldName, undefined);
    }
  };
}
