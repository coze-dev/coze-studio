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
