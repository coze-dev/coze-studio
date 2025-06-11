import { type FC } from 'react';

import { Select, type SelectProps } from '@coze/coze-design';

type IProps = SelectProps & { label: string };
export const LabelSelect: FC<IProps> = props => {
  const { label, ...rest } = props;
  return (
    <div className="w-full flex gap-[8px] justify-between items-center text-[14px]">
      <div className="min-w-[80px]">{label}</div>
      <Select {...rest} />
    </div>
  );
};
