import { type FC } from 'react';

import { I18n } from '@coze-arch/i18n';
import { Select, type SelectProps } from '@coze/coze-design';

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
