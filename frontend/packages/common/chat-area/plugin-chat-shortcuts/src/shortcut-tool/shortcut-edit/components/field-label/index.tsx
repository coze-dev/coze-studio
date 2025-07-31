/*
 * Copyright 2025 coze-dev Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
