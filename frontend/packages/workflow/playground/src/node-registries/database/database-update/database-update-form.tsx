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

import { I18n } from '@coze-arch/i18n';

import { useResetCondition } from '@/node-registries/database/common/hooks';
import {
  ConditionField,
  DatabaseSelectField,
  OutputsField,
  SelectAndSetFieldsField,
} from '@/node-registries/database/common/fields';
import { withNodeConfigForm } from '@/node-registries/common/hocs';
import { useCurrentDatabaseQuery } from '@/hooks';
import {
  databaseSelectFieldName,
  updateConditionFieldName,
  updateSelectAndSetFieldsFieldName,
} from '@/constants/database-field-names';

import { useResetSelectAndSetFields } from './use-reset-select-and-set-fields';

export const DatabaseUpdateForm: React.FC = withNodeConfigForm(() => {
  const { data: currentDatabase } = useCurrentDatabaseQuery();
  const resetCondition = useResetCondition(updateConditionFieldName);
  const resetSelectAndSetFields = useResetSelectAndSetFields();

  return (
    <>
      <DatabaseSelectField
        name={databaseSelectFieldName}
        afterChange={() => {
          resetCondition();
          resetSelectAndSetFields();
        }}
      />
      {currentDatabase ? (
        <ConditionField
          label={I18n.t('workflow_update_condition_title')}
          name={updateConditionFieldName}
          min={1}
        />
      ) : null}
      {currentDatabase ? (
        <SelectAndSetFieldsField name={updateSelectAndSetFieldsFieldName} />
      ) : null}
      <OutputsField name="outputs" />
    </>
  );
});
