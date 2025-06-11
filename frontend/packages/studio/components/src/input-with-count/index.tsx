import { useMemo } from 'react';

import { type InputProps } from '@coze-arch/bot-semi/Input';
import { UIInput, withField } from '@coze-arch/bot-semi';
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
    <UIInput
      {...props}
      suffix={
        Boolean(maxLength) && <LimitCount maxLen={maxLength ?? 0} len={len} />
      }
    />
  );
};

export const InputWithCountField = withField(InputWithCount);
