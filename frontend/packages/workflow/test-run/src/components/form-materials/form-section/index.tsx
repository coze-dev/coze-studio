import React, { useState } from 'react';

import cls from 'classnames';
import {
  IconCozArrowDownFill,
  IconCozInfoCircle,
} from '@coze-arch/coze-design/icons';
import { Collapsible, Tooltip, Typography } from '@coze-arch/coze-design';

import css from './index.module.less';

export interface FormSectionProps {
  title?: React.ReactNode;
  tooltip?: React.ReactNode;
  action?: React.ReactNode;
  collapsible?: boolean;
}

export const FormSection: React.FC<
  React.PropsWithChildren<FormSectionProps>
> = ({ title, tooltip, action, collapsible, children }) => {
  const [isOpen, setIsOpen] = useState(true);

  const handleExpand = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className={css['form-section']}>
      <div className={css['section-header']}>
        <div
          className={css['section-title']}
          onClick={collapsible ? handleExpand : undefined}
        >
          {collapsible ? (
            <IconCozArrowDownFill
              className={cls(css['title-collapsible'], {
                [css['is-close']]: !isOpen,
              })}
            />
          ) : null}

          <Typography.Text strong>{title}</Typography.Text>

          {tooltip ? (
            <Tooltip content={tooltip}>
              <IconCozInfoCircle className={css['title-tooltip']} />
            </Tooltip>
          ) : null}
        </div>
        {action ? (
          <div
            className={css['section-action']}
            onClick={e => {
              e.stopPropagation();
            }}
          >
            {action}
          </div>
        ) : null}
      </div>
      <Collapsible keepDOM fade isOpen={isOpen}>
        <div className={css['section-context']}>{children}</div>
      </Collapsible>
    </div>
  );
};
