import cls from 'classnames';
import { connect, mapProps } from '@formily/react';
import { TextArea as TextAreaCore } from '@coze/coze-design';

import css from './text-area.module.less';

export interface TextAreaProps {
  size?: string;
  className?: string;
}

const TextAreaAdapter: React.FC<TextAreaProps> = ({
  size,
  className,
  ...props
}) => (
  <TextAreaCore
    className={cls(
      {
        [css['text-area-small']]: size === 'small',
      },
      className,
    )}
    {...props}
  />
);

export const TextArea = connect(
  TextAreaAdapter,
  mapProps({ validateStatus: true }),
);
