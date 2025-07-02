import { type FC } from 'react';

import classnames from 'classnames';

import { Text } from '@/form-extensions/components/text';

export const Notify: FC<{
  text: string;
  align?: 'left' | 'center' | 'right';
  className?: string;
  isBreakLine?: boolean;
}> = ({ text, align = 'center', className = '', isBreakLine = false }) => (
  <div
    className={classnames(
      'w-full !px-[8px] !py-[6px] flex flex-row items-center coz-mg-hglt-secondary text-[14px]',

      {
        'justify-center': align === 'center',
        'justify-end': align === 'right',
        'justify-start': align === 'left',
      },
      className,
    )}
  >
    {isBreakLine ? text : <Text text={text} />}
  </div>
);
