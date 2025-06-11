import { type FC } from 'react';

import classnames from 'classnames';
import { type SetterComponentProps } from '@flowgram-adapter/free-layout-editor';

type NotifyProps = SetterComponentProps;
import { Text } from '@/form-extensions/components/text';

export const Notify: FC<{
  text: string;
  align?: 'left' | 'center' | 'right';
  className?: string;
  // 是否换行
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

const NotifyField: FC<NotifyProps> = props => (
  <Notify text={props.options?.text} {...props.options} />
);

export const notify = {
  key: 'Notify',
  component: NotifyField,
};
