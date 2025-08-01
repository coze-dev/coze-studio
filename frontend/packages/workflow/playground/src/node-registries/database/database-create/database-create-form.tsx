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

import { useResetSelectAndSetFields } from '@/node-registries/database/common/hooks';
import {
  SelectAndSetFieldsField,
  DatabaseSelectField,
  OutputsField,
} from '@/node-registries/database/common/fields';
import { withNodeConfigForm } from '@/node-registries/common/hocs';
import { useCurrentDatabaseQuery } from '@/hooks';
import {
  createSelectAndSetFieldsFieldName,
  databaseSelectFieldName,
} from '@/constants/database-field-names';

export const DatabaseCreateForm: React.FC = withNodeConfigForm(() => {
  const { data: currentDatabase } = useCurrentDatabaseQuery();
  const resetSelectAndSetFields = useResetSelectAndSetFields(
    createSelectAndSetFieldsFieldName,
  );

  return (
    <>
      <DatabaseSelectField
        name={databaseSelectFieldName}
        afterChange={() => {
          resetSelectAndSetFields();
        }}
      />
      {currentDatabase ? (
        <SelectAndSetFieldsField
          name={createSelectAndSetFieldsFieldName}
          shouldDisableRemove={field => field?.required ?? false}
        />
      ) : null}
      <OutputsField name="outputs" />
    </>
  );
});
