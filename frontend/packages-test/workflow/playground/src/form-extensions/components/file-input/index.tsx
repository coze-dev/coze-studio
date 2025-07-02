import { useEffect } from 'react';

import classNames from 'classnames';
import {
  type LiteralExpression,
  type ViewVariableType,
} from '@coze-workflow/base';
import { type SelectProps } from '@coze-arch/bot-semi/Select';

import { UploadProvider, useUploadContext } from './upload-context';
import { SingleInputNew, MultipleInputNew } from './components';
export interface UploadInputProps {
  inputType: ViewVariableType;
  availableFileTypes?: ViewVariableType[];
  onChange?: (value) => void;
  value?: LiteralExpression;
  validateStatus?: SelectProps['validateStatus'];
  onBlur?: () => void;
  onUploadChange?: (uploading: boolean) => void;
}

const Input = ({ onUploadChange }) => {
  const { multiple, isUploading } = useUploadContext();

  useEffect(() => {
    onUploadChange?.(isUploading);
  }, [isUploading]);

  return (
    <div className={classNames('w-full pl-0.5', multiple ? 'h-full' : 'h-5')}>
      {multiple ? <MultipleInputNew /> : <SingleInputNew />}
    </div>
  );
};

export const FileInput = (props: UploadInputProps) => {
  const {
    value,
    onChange,
    onBlur,
    inputType,
    availableFileTypes,
    onUploadChange,
  } = props;

  return (
    <UploadProvider
      inputType={inputType}
      availableFileTypes={availableFileTypes}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
    >
      <Input onUploadChange={onUploadChange} />
    </UploadProvider>
  );
};
