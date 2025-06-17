import { type FC } from 'react';

import { Cascader } from '@coze-arch/coze-design';

import s from './text-family.module.less';

interface IProps {
  value: string;
  onChange: (value: string) => void;
}
export const TextFamily: FC<IProps> = props => {
  // (props, ref) => {
  const { onChange, value, ...rest } = props;
  return (
    <Cascader
      {...rest}
      value={value?.split('-')?.reverse()}
      onChange={v => {
        onChange?.((v as string[])?.reverse()?.join('-'));
      }}
      dropdownClassName={s['imageflow-canvas-font-family-cascader']}
    />
  );
};
