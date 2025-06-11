import { FC, useRef } from 'react';

import cs from 'classnames';
import { InputProps } from '@douyinfe/semi-ui/lib/es/input';
import { CommonFieldProps } from '@douyinfe/semi-ui/lib/es/form';
import { withField } from '@douyinfe/semi-ui';

import { Input } from '../../ui-input';

import s from './index.module.less';

const InputInner = withField(Input, {});

export const UIFormInput: FC<CommonFieldProps & InputProps> = ({
  fieldClassName,
  ...props
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div
      style={{
        // @ts-expect-error ts 无法识别 css 自定义变量
        '--var-error-msg-offset': props.addonBefore
          ? `${inputRef.current?.offsetLeft ?? 0}px`
          : '0px',
      }}
    >
      <InputInner
        {...props}
        fieldClassName={cs(fieldClassName, s.field)}
        ref={inputRef}
      />
    </div>
  );
};
