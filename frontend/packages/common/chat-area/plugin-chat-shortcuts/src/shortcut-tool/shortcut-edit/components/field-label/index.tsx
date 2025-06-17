import React, { type FC, type PropsWithChildren, type ReactNode } from 'react';

import cs from 'classnames';
import { Tooltip, type TooltipProps } from '@coze-arch/coze-design';
import { Form } from '@coze-arch/bot-semi';
import { IconInfo } from '@coze-arch/bot-icons';

export const FieldLabel: FC<
  PropsWithChildren<{
    className?: string;
    tooltip?: TooltipProps;
    tip?: ReactNode;
    required?: boolean;
  }>
> = ({ children, className, tooltip, tip, required = false }) => (
  <div className="flex items-center mb-[6px]">
    <Form.Label
      text={children}
      className="!coz-fg-primary !text-[14px] !leading-[20px] !m-0"
      required={required}
    />
    {!!tip && (
      <Tooltip content={tip} {...tooltip}>
        <IconInfo className={cs('coz-fg-secondary ml-[-12px]', className)} />
      </Tooltip>
    )}
  </div>
);

export default FieldLabel;
