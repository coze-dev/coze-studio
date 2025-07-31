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

import { type FC } from 'react';

import { I18n } from '@coze-arch/i18n';
import { Select, type SelectProps } from '@coze-arch/coze-design';

import { FileInputType } from '../types';

interface FileInputTypeSelectProps {
  disabled?: boolean;
  value: FileInputType;
  onChange: (v: FileInputType) => void;
  onBlur?: SelectProps['onBlur'];
}

export const FileInputTypeSelect: FC<FileInputTypeSelectProps> = ({
  disabled,
  value,
  onChange,
  onBlur,
}) => {
  const options = [
    {
      label: I18n.t('workflow_250310_09', undefined, '通过上传'),
      value: FileInputType.UPLOAD,
    },
    {
      label: I18n.t('workflow_250310_10', undefined, '输入URL'),
      value: FileInputType.INPUT,
    },
  ];

  return (
    <Select
      size="small"
      className="w-full"
      disabled={disabled}
      value={value}
      onChange={v => {
        onChange(v as FileInputType);
      }}
      onBlur={onBlur}
    >
      {options.map(option => (
        <Select.Option {...option} />
      ))}
    </Select>
  );
};
