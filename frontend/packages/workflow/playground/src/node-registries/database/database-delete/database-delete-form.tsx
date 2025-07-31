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
  DatabaseSelectField,
  OutputsField,
  ConditionField,
} from '@/node-registries/database/common/fields';
import { withNodeConfigForm } from '@/node-registries/common/hocs';
import { useCurrentDatabaseQuery } from '@/hooks';
import {
  databaseSelectFieldName,
  deleteConditionFieldName,
} from '@/constants/database-field-names';

export const DatabaseDeleteForm: React.FC = withNodeConfigForm(() => {
  const { data: currentDatabase } = useCurrentDatabaseQuery();
  const resetCondition = useResetCondition(deleteConditionFieldName);

  return (
    <>
      <DatabaseSelectField
        name={databaseSelectFieldName}
        afterChange={() => {
          resetCondition();
        }}
      />
      {currentDatabase ? (
        <ConditionField
          label={I18n.t('workflow_delete_conditon_title')}
          name={deleteConditionFieldName}
          min={1}
        />
      ) : null}
      <OutputsField name="outputs" />
    </>
  );
});
