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
