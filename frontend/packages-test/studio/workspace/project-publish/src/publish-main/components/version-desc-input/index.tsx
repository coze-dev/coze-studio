import { type CSSProperties, useEffect, useRef, useState } from 'react';

import classNames from 'classnames';
import {
  type CommonFieldProps,
  Input,
  TextArea,
  type TextAreaProps,
  withField,
} from '@coze-arch/coze-design';

import styles from './index.module.less';

export interface VersionDescInputProps
  extends Pick<
    TextAreaProps,
    'placeholder' | 'maxLength' | 'maxCount' | 'wrapperClassName' | 'value'
  > {
  onChange?: (value: string) => void;
  inputClassName?: string;
  textAreaClassName?: string;
  textAreaStyle?: CSSProperties;
}

const VersionDescInput: React.FC<VersionDescInputProps> = ({
  inputClassName,
  textAreaClassName,
  wrapperClassName,
  textAreaStyle,
  ...props
}) => {
  const [mode, setMode] = useState<'input' | 'textarea'>('input');
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const target = textAreaRef.current;
    if (mode !== 'textarea' || !target) {
      return;
    }
    const valueLength = props.value?.length;
    target.focus();
    if (!valueLength) {
      return;
    }
    target.setSelectionRange(valueLength, valueLength);
  }, [mode]);

  if (mode === 'input') {
    return (
      <Input
        {...props}
        className={classNames(styles['desc-input'], inputClassName)}
        onFocus={() => {
          setMode('textarea');
        }}
      />
    );
  }

  return (
    <div className={wrapperClassName}>
      <TextArea
        {...props}
        ref={textAreaRef}
        className={textAreaClassName}
        style={textAreaStyle}
        autoFocus
        autosize={{ minRows: 1, maxRows: 10 }}
        onBlur={() => {
          setMode('input');
        }}
      />
    </div>
  );
};

export const FormVersionDescInput: React.FC<
  CommonFieldProps & VersionDescInputProps
> = withField(VersionDescInput);
