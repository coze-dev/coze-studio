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

import { get } from 'lodash-es';
import {
  useWorkflowNode,
  type DatabaseSettingField,
  type DatabaseField,
} from '@coze-workflow/base';

import { useCurrentDatabaseQuery } from '@/hooks';

import {
  VariableTagList,
  type VariableTagProps,
  VariableTagStatus,
} from './variable-tag-list';
import { Field } from './field';

interface SettingFieldsProps {
  label: string;
  name: string;
}

/**
 * Database field setting component
 * @Param props.label title
 * @Param props.name field path to get field settings from node data
 */
export function DatabaseSettingFields({ label, name }: SettingFieldsProps) {
  const { data: database, isLoading, error } = useCurrentDatabaseQuery();
  const value = useValue(name);
  const variableTagList = getVariableTagList(
    value,
    !error ? database?.fields : [],
  );
  const isEmpty = variableTagList.length === 0;
  return (
    <Field label={label} isEmpty={isEmpty}>
      {isLoading ? null : <VariableTagList value={variableTagList} />}
    </Field>
  );
}

function useValue(name: string) {
  const { data } = useWorkflowNode();
  const value = get(data, name) as DatabaseSettingField[];
  return value;
}

function getVariableTagList(
  value: DatabaseSettingField[] = [],
  fields: DatabaseField[] = [],
): VariableTagProps[] {
  return value?.map(settingField => {
    const field = fields.find(item => item.id === settingField.fieldID);
    const variableTag: VariableTagProps = getVariableTagProps(
      settingField,
      field,
    );
    return variableTag;
  });
}

function getVariableTagProps(
  settingField: DatabaseSettingField,
  field?: DatabaseField,
): VariableTagProps {
  const content = settingField.fieldValue?.content;
  return {
    key: settingField.fieldID.toString(),
    label: field?.name,
    type: field?.type,
    status:
      content || content === false
        ? VariableTagStatus.Default
        : VariableTagStatus.Warning,
  };
}
