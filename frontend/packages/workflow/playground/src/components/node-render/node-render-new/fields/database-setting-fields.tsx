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
 * 数据库字段设置组件
 * @param props.label 标题
 * @param props.name 字段路径，用于从节点数据中获取字段设置值
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
