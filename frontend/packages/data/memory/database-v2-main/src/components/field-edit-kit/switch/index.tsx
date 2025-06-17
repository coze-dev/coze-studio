import { type FC, useState } from 'react';

import { cloneDeep } from 'lodash-es';
import { Switch } from '@coze-arch/coze-design';

import {
  type ChangeDataParams,
  type TableRow,
} from '../../database-table-data/type';

interface IProps {
  rowData: TableRow;
  checked: boolean | undefined;
  rowKey: string;
  fieldName: string;
  required: boolean;
  disabled: boolean;
  onChange?: (params: ChangeDataParams) => void;
}

export const EditKitSwitch: FC<IProps> = props => {
  const { checked, onChange, fieldName, rowData, disabled } = props;

  const [internalValue, setInternalValue] = useState(checked);

  const handleChange = (isChecked: boolean) => {
    setInternalValue(isChecked);
    const newRowData = cloneDeep(rowData);
    newRowData[fieldName].value = isChecked;
    onChange?.({
      newRowData,
    });
  };

  return (
    <Switch
      disabled={disabled}
      checked={internalValue}
      onChange={handleChange}
      size="small"
    />
  );
};
