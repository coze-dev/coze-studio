import { useState } from 'react';

import { I18n } from '@coze-arch/i18n';
import { ColumnType } from '@coze-arch/bot-api/knowledge';

import SinglelineSelect, {
  type SinglelineSelectProps,
} from '../singleline-select';

export const getDataTypeText = (value: ColumnType) => {
  const dataTypes = {
    [ColumnType.Unknown]: 'Unknown',
    [ColumnType.Text]: I18n.t('db_add_table_field_type_txt'),
    [ColumnType.Number]: I18n.t('db_add_table_field_type_int'),
    [ColumnType.Date]: I18n.t('db_add_table_field_type_time'),
    [ColumnType.Float]: I18n.t('db_add_table_field_type_number'),
    [ColumnType.Boolean]: I18n.t('db_add_table_field_type_bool'),
    [ColumnType.Image]: I18n.t('knowledge_insert_img_010'),
  };
  return dataTypes[value] || '';
};
export const getDataTypeOptions = () => [
  { value: ColumnType.Text, label: getDataTypeText(ColumnType.Text) },
  { value: ColumnType.Number, label: getDataTypeText(ColumnType.Number) },
  { value: ColumnType.Date, label: getDataTypeText(ColumnType.Date) },
  { value: ColumnType.Float, label: getDataTypeText(ColumnType.Float) },
  { value: ColumnType.Boolean, label: getDataTypeText(ColumnType.Boolean) },
  { value: ColumnType.Image, label: getDataTypeText(ColumnType.Image) },
];

export const DataTypeSelect = (props: SinglelineSelectProps) => {
  const [selectValue, setSelectValue] = useState<
    SinglelineSelectProps['value']
  >(props.value);
  return (
    <SinglelineSelect
      value={selectValue}
      selectProps={{
        ...props.selectProps,
        optionList: props.selectProps?.optionList || getDataTypeOptions(),
      }}
      errorMsg={props.errorMsg}
      handleChange={v => {
        setSelectValue(v as SinglelineSelectProps['value']);
        props.handleChange?.(v);
      }}
    />
  );
};
