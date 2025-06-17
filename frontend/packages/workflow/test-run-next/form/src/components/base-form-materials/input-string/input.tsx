import clsx from 'clsx';
import { TextArea } from '@coze-arch/coze-design';

import css from './input.module.less';

export interface InputStringProps {
  value?: string;
}

export const InputString: React.FC<InputStringProps> = props => (
  <TextArea
    className={clsx(css['input-string'], css.small)}
    autosize={{ minRows: 1, maxRows: 5 }}
    rows={1}
    showClear
    {...props}
  />
);
