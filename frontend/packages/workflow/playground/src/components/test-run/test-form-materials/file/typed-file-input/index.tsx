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

import { useState } from 'react';

import classNames from 'classnames';

import { type BaseFileProps, FileInputType } from '../types';
import { FileBaseAdapter } from '../base-adapter';
import { URLInput } from './url-input';
import { FileInputTypeSelect } from './type-select';

import styles from './index.module.less';

export const TypedFileInput: React.FC<BaseFileProps> = ({
  fileInputType,
  onInputTypeChange,
  ...props
}) => {
  const [type, setType] = useState<FileInputType>(
    (fileInputType as FileInputType) || FileInputType.UPLOAD,
  );

  return (
    <div className="relative">
      <div
        className={classNames(
          styles['file-input-type-select'],
          'overflow-hidden absolute top-[-32px] right-0 w-[95px]',
          props.inputTypeSelectClassName,
        )}
      >
        <FileInputTypeSelect
          value={type}
          onChange={newType => {
            setType(newType);
            onInputTypeChange?.(newType);
          }}
          disabled={props.disabled}
        />
      </div>

      {type === FileInputType.UPLOAD ? (
        <FileBaseAdapter {...props} />
      ) : (
        <URLInput {...props} />
      )}
    </div>
  );
};
