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

import {
  DatabaseSelectField,
  ConditionField,
  OutputsField,
} from '@/node-registries/database/common/fields';
import { withNodeConfigForm } from '@/node-registries/common/hocs';
import { useCurrentDatabaseQuery } from '@/hooks';
import {
  databaseSelectFieldName,
  queryFieldsFieldName,
  queryConditionFieldName,
  orderByFieldName,
  queryLimitFieldName,
} from '@/constants/database-field-names';

import { useResetFields } from './use-reset-fields';
import { QueryLimitField } from './query-limit-field';
import { QueryFieldsField } from './query-fields-field';
import { OrderByField } from './order-by-field';

export const DatabaseQueryForm: React.FC = withNodeConfigForm(() => {
  const { data: currentDatabase } = useCurrentDatabaseQuery();
  const resetFields = useResetFields();

  return (
    <>
      <DatabaseSelectField
        name={databaseSelectFieldName}
        afterChange={resetFields}
      />
      {currentDatabase ? (
        <QueryFieldsField name={queryFieldsFieldName} />
      ) : null}
      {currentDatabase ? (
        <ConditionField
          label={I18n.t('workflow_query_condition_title')}
          name={queryConditionFieldName}
        />
      ) : null}
      {currentDatabase ? <OrderByField name={orderByFieldName} /> : null}
      {currentDatabase ? <QueryLimitField name={queryLimitFieldName} /> : null}
      <OutputsField deps={[queryFieldsFieldName]} name="outputs" />
    </>
  );
});
