import { useMemo } from 'react';

import { Input, type InputProps, withField } from '@coze/coze-design';
import 'utility-types';

import s from './index.module.less';

interface LimitCountProps {
  maxLen: number;
  len: number;
}

const LimitCount: React.FC<LimitCountProps> = ({ maxLen, len }) => (
  <span className={s['limit-count']}>
    <span>{len}</span>
    <span>/</span>
    <span>{maxLen}</span>
  </span>
);

export interface InputWithCountProps extends InputProps {
  // 设置字数限制并显示字数统计
  getValueLength?: (value?: InputProps['value'] | string) => number;
}

export const InputWithCount: React.FC<InputWithCountProps> = props => {
  const { value, maxLength, getValueLength } = props;

  const len = useMemo(() => {
    if (getValueLength) {
      return getValueLength(value);
    } else if (value) {
      return value.toString().length;
    } else {
      return 0;
    }
  }, [value, getValueLength]);

  return (
    <Input
      {...props}
      autoComplete="off"
      suffix={
        Boolean(maxLength) && <LimitCount maxLen={maxLength ?? 0} len={len} />
      }
    />
  );
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const CozeInputWithCountField: any = withField(InputWithCount);
