import React from 'react';

import { Form } from '@coze-arch/bot-semi';

import style from './index.module.less';

// TODO: hzf, 取名component有点奇怪
export type FormInputWithMaxCountProps = {
  maxCount: number;
} & React.ComponentProps<typeof Form.Input>;
// input后带上suffix，表示能够输入的最大字数
export const FormInputWithMaxCount = (props: FormInputWithMaxCountProps) => {
  const [count, setCount] = React.useState(0);
  const handleChange = (v: string) => {
    setCount(v.length);
  };
  const countSuffix = (
    <div
      className={style['form-input-with-count']}
    >{`${count}/${props.maxCount}`}</div>
  );
  return (
    <Form.Input
      {...props}
      onChange={value => handleChange(value)}
      suffix={countSuffix}
    />
  );
};
