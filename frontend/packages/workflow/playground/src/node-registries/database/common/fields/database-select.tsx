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
