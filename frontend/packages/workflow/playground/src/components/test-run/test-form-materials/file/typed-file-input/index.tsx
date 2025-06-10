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
