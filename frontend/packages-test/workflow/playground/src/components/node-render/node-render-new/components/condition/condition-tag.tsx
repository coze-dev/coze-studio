import { type PropsWithChildren, type FC, type ReactNode } from 'react';

import classnames from 'classnames';
import { Tag, Tooltip } from '@coze-arch/coze-design';

import styles from './condition-tag.module.less';

export const ConditionTag: FC<
  PropsWithChildren<{
    tooltip?: ReactNode;
    invalid?: boolean;
  }>
> = props => {
  const color = props.invalid ? 'yellow' : 'primary';
  if (props.tooltip && !props.invalid) {
    return (
      <Tooltip content={props.tooltip}>
        <Tag
          color={color}
          className={classnames(
            styles['condition-tag'],
            'font-medium truncate w-full',
          )}
        >
          {props.children}
        </Tag>
      </Tooltip>
    );
  } else {
    return (
      <Tag
        color={color}
        className={classnames(
          styles['condition-tag'],
          'font-medium truncate w-full',
        )}
      >
        {props.children}
      </Tag>
    );
  }
};
