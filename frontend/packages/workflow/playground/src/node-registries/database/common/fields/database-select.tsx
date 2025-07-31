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

import { useState, useEffect } from 'react';

import { useNodeTestId, type WorkflowDatabase } from '@coze-workflow/base';
import { I18n } from '@coze-arch/i18n';

import { useCurrentDatabaseQuery } from '@/hooks';
import {
  DatabaseSelect,
  type DatabaseSelectValue,
} from '@/form-extensions/setters/database-select';
import { Section, Field, type FieldProps } from '@/form';

type DatabaseSelectFieldProps = FieldProps<DatabaseSelectValue> & {
  afterChange?: (value?: WorkflowDatabase) => void;
};

export const DatabaseSelectField = ({
  name,
  label,
  tooltip,
  afterChange,
  ...rest
}: DatabaseSelectFieldProps) => {
  const [changed, setChanged] = useState(false);
  const { data: currentDatabase, isLoading } = useCurrentDatabaseQuery();

  const { getNodeSetterId } = useNodeTestId();

  useEffect(() => {
    if (changed && !isLoading) {
      afterChange?.(currentDatabase);
      setChanged(false);
    }
  }, [currentDatabase?.id]);

  return (
    <Section title={I18n.t('workflow_database_node_database_table_title')}>
      <Field<DatabaseSelectValue> name={name} {...rest}>
        {({ value, onChange, readonly }) => (
          <DatabaseSelect
            value={value}
            readonly={readonly}
            onChange={newValue => {
              onChange(newValue);
              setChanged(true);
            }}
            addButtonTestID={getNodeSetterId(`${name}.addButton`)}
            libraryCardTestID={getNodeSetterId(`${name}.libraryCard`)}
          />
        )}
      </Field>
    </Section>
  );
};
